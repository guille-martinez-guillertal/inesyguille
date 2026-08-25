'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Language, wedding } from './content';

type Direction = 'TO_WEDDING' | 'FROM_WEDDING';
type Guest = { id: string; displayName: string; phone: string | null };
type Ride = {
  id: string;
  driver_guest_id: string;
  driver_name: string;
  direction: Direction;
  area_name: string;
  departure_at: string;
  seat_capacity: number;
  remaining_seats: number;
  notes: string | null;
};
type MyRequest = {
  id: string;
  ride_id: string;
  seats_requested: number;
  status: 'REQUESTED' | 'ACCEPTED';
  direction: Direction;
  area_name: string;
  departure_at: string;
  driver_name: string;
  driver_phone: string | null;
};
type IncomingRequest = {
  id: string;
  ride_id: string;
  seats_requested: number;
  status: 'REQUESTED' | 'ACCEPTED';
  passenger_name: string;
  passenger_phone: string | null;
};
type Dashboard = {
  guest: Guest;
  rides: Ride[];
  myRequests: MyRequest[];
  incomingRequests: IncomingRequest[];
};
type RideDraft = {
  direction: Direction;
  areaName: string;
  date: string;
  time: string;
  seatCapacity: number;
  notes: string;
};

const newRide = (direction: Direction): RideDraft => ({
  direction,
  areaName: '',
  date: direction === 'TO_WEDDING' ? '2026-09-26' : '2026-09-27',
  time: direction === 'TO_WEDDING' ? '11:00' : '12:00',
  seatCapacity: 1,
  notes: '',
});

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = (await response.json().catch(() => ({}))) as { message?: string } & T;
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export default function CarSharing({ language }: { language: Language }) {
  const copy = wedding.content[language].carShare;
  const [guest, setGuest] = useState<Guest | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [direction, setDirection] = useState<Direction>('TO_WEDDING');
  const [rideDraft, setRideDraft] = useState<RideDraft>(newRide('TO_WEDDING'));
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [requestSeats, setRequestSeats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadDashboard = useCallback(async () => {
    const data = await requestJson<Dashboard>('/api/rides');
    setGuest(data.guest);
    setDashboard(data);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        const token = window.location.hash.startsWith('#g=')
          ? decodeURIComponent(window.location.hash.slice(3))
          : null;
        if (token) {
          await requestJson<{ guest: Guest }>('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
        }
        const session = await requestJson<{ guest: Guest }>('/api/session');
        if (!active) return;
        setGuest(session.guest);
        await loadDashboard();
      } catch {
        if (active) {
          setGuest(null);
          setDashboard(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialise();
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const filteredRides = useMemo(
    () => (dashboard?.rides ?? []).filter((ride) => ride.direction === direction),
    [dashboard, direction],
  );
  const pendingRequestRideIds = useMemo(
    () => new Set(
      (dashboard?.myRequests ?? [])
        .filter((request) => request.status === 'REQUESTED')
        .map((request) => request.ride_id),
    ),
    [dashboard],
  );

  async function identify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setNotice(null);
    try {
      const data = await requestJson<{ guest: Guest }>('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.get('displayName'),
          phone: form.get('phone') || null,
        }),
      });
      setGuest(data.guest);
      await loadDashboard();
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await requestJson('/api/session', { method: 'DELETE' });
      setGuest(null);
      setDashboard(null);
      setNotice(null);
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action: () => Promise<void>, success: string) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      await loadDashboard();
      setNotice({ kind: 'success', text: success });
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function saveRide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      direction: rideDraft.direction,
      areaName: rideDraft.areaName,
      departureAt: `${rideDraft.date}T${rideDraft.time}`,
      seatCapacity: rideDraft.seatCapacity,
      notes: rideDraft.notes || null,
    };
    await runAction(
      async () => {
        await requestJson(editingRideId ? `/api/rides/${editingRideId}` : '/api/rides', {
          method: editingRideId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setFormOpen(false);
        setEditingRideId(null);
        setRideDraft(newRide(direction));
      },
      editingRideId ? copy.updated : copy.created,
    );
  }

  function beginOffer() {
    setEditingRideId(null);
    setRideDraft(newRide(direction));
    setFormOpen(true);
    setNotice(null);
  }

  function beginEdit(ride: Ride) {
    setEditingRideId(ride.id);
    setDirection(ride.direction);
    setRideDraft({
      direction: ride.direction,
      areaName: ride.area_name,
      date: ride.departure_at.slice(0, 10),
      time: ride.departure_at.slice(11, 16),
      seatCapacity: Number(ride.seat_capacity),
      notes: ride.notes ?? '',
    });
    setFormOpen(true);
    setNotice(null);
  }

  function formatDeparture(value: string) {
    const date = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
    return `${date} · ${value.slice(11, 16)}`;
  }

  function seatsLabel(value: number) {
    if (language === 'es') return `${value} ${value === 1 ? 'plaza' : 'plazas'}`;
    return `${value} ${value === 1 ? 'seat' : 'seats'}`;
  }

  return (
    <section className="car-share section warm-section" id="rides" aria-labelledby="rides-title">
      <div className="section-heading">
        <p className="section-label">{copy.label}</p>
        <h2 id="rides-title">{copy.title}</h2>
      </div>
      <p className="car-share-intro">{copy.intro}</p>

      {loading ? (
        <div className="ride-loading" role="status">{copy.loading}</div>
      ) : !guest ? (
        <div className="identity-card">
          <div>
            <p className="micro-label">{copy.identifyTitle}</p>
            <p>{copy.identifyText}</p>
          </div>
          <form onSubmit={identify} className="identity-form">
            <label>
              <span>{copy.name}</span>
              <input name="displayName" placeholder={copy.namePlaceholder} minLength={2} maxLength={80} required />
            </label>
            <label>
              <span>{copy.phone}</span>
              <input name="phone" type="tel" placeholder={copy.phonePlaceholder} maxLength={30} />
            </label>
            <button className="button primary-button" type="submit" disabled={busy}>{copy.enter}</button>
          </form>
          <p className="privacy-note"><span aria-hidden="true">◌</span>{copy.privacy}</p>
        </div>
      ) : (
        <div className="car-share-app">
          <header className="ride-toolbar">
            <p>{copy.greeting}, <strong>{guest.displayName}</strong></p>
            <div>
              <button className="button compact-button" type="button" onClick={beginOffer}>{copy.offer}</button>
              <button className="text-action" type="button" onClick={signOut} disabled={busy}>{copy.signOut}</button>
            </div>
          </header>

          {notice && <p className={`ride-notice ${notice.kind}`} role="status">{notice.text}</p>}

          {formOpen && (
            <form className="ride-form" onSubmit={saveRide}>
              <div className="ride-form-heading">
                <h3>{editingRideId ? copy.editRide : copy.offer}</h3>
                <button type="button" className="text-action" onClick={() => setFormOpen(false)}>{copy.cancelEdit}</button>
              </div>
              <fieldset className="direction-choice">
                <legend className="sr-only">Direction</legend>
                {(['TO_WEDDING', 'FROM_WEDDING'] as Direction[]).map((value) => (
                  <label key={value} className={rideDraft.direction === value ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="direction"
                      checked={rideDraft.direction === value}
                      onChange={() => setRideDraft((draft) => ({ ...draft, direction: value }))}
                    />
                    {value === 'TO_WEDDING' ? copy.toWedding : copy.fromWedding}
                  </label>
                ))}
              </fieldset>
              <div className="ride-form-grid">
                <label className="wide-field">
                  <span>{rideDraft.direction === 'TO_WEDDING' ? copy.areaTo : copy.areaFrom}</span>
                  <input value={rideDraft.areaName} onChange={(event) => setRideDraft((draft) => ({ ...draft, areaName: event.target.value }))} placeholder={copy.areaPlaceholder} minLength={2} maxLength={80} required />
                </label>
                <label><span>{copy.date}</span><input type="date" min="2026-09-24" max="2026-09-28" value={rideDraft.date} onChange={(event) => setRideDraft((draft) => ({ ...draft, date: event.target.value }))} required /></label>
                <label><span>{copy.time}</span><input type="time" value={rideDraft.time} onChange={(event) => setRideDraft((draft) => ({ ...draft, time: event.target.value }))} required /></label>
                <label><span>{copy.seats}</span><select value={rideDraft.seatCapacity} onChange={(event) => setRideDraft((draft) => ({ ...draft, seatCapacity: Number(event.target.value) }))}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
                <label className="wide-field"><span>{copy.notes}</span><textarea value={rideDraft.notes} onChange={(event) => setRideDraft((draft) => ({ ...draft, notes: event.target.value }))} placeholder={copy.notesPlaceholder} maxLength={500} rows={3} /></label>
              </div>
              <button className="button primary-button" type="submit" disabled={busy}>{editingRideId ? copy.updateRide : copy.saveRide}</button>
            </form>
          )}

          <div className="ride-tabs" role="tablist" aria-label={copy.available}>
            {(['TO_WEDDING', 'FROM_WEDDING'] as Direction[]).map((value) => (
              <button key={value} type="button" role="tab" aria-selected={direction === value} className={direction === value ? 'active' : ''} onClick={() => setDirection(value)}>{value === 'TO_WEDDING' ? copy.toWedding : copy.fromWedding}</button>
            ))}
          </div>

          <div className="rides-heading"><h3>{copy.available}</h3><span>{filteredRides.length}</span></div>
          {filteredRides.length === 0 ? <p className="empty-rides">{copy.empty}</p> : (
            <div className="ride-card-grid">
              {filteredRides.map((ride) => {
                const mine = ride.driver_guest_id === guest.id;
                const remaining = Number(ride.remaining_seats);
                return (
                  <article className={`ride-card${mine ? ' own' : ''}`} key={ride.id}>
                    <div className="ride-card-top"><p className="micro-label">{mine ? copy.ownRide : ride.driver_name}</p><span className={remaining ? 'seat-badge' : 'seat-badge full'}>{remaining ? seatsLabel(remaining) : copy.full}</span></div>
                    <h4>{ride.area_name} <span aria-hidden="true">{ride.direction === 'TO_WEDDING' ? '→' : '←'}</span> Finca El Venero</h4>
                    <time dateTime={ride.departure_at}>{formatDeparture(ride.departure_at)}</time>
                    {ride.notes && <p className="ride-notes">{ride.notes}</p>}
                    {mine ? (
                      <div className="ride-card-actions">
                        <button className="text-action" type="button" onClick={() => beginEdit(ride)}>{copy.edit}</button>
                        <button className="text-action danger" type="button" disabled={busy} onClick={() => { if (confirm(copy.confirmCancelRide)) void runAction(() => requestJson(`/api/rides/${ride.id}`, { method: 'DELETE' }), copy.rideCancelled); }}>{copy.cancelRide}</button>
                      </div>
                    ) : remaining > 0 && !pendingRequestRideIds.has(ride.id) ? (
                      <div className="request-row">
                        <label><span>{copy.requestSeats}</span><select value={requestSeats[ride.id] ?? 1} onChange={(event) => setRequestSeats((current) => ({ ...current, [ride.id]: Number(event.target.value) }))}>{Array.from({ length: remaining }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
                        <button className="button compact-button" type="button" disabled={busy} onClick={() => void runAction(() => requestJson(`/api/rides/${ride.id}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seatsRequested: requestSeats[ride.id] ?? 1 }) }), copy.requestSent)}>{copy.request}</button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}

          <div className="ride-management-grid">
            <section className="ride-management" aria-labelledby="my-requests-title">
              <div className="rides-heading"><h3 id="my-requests-title">{copy.myRequests}</h3><span>{dashboard?.myRequests.length ?? 0}</span></div>
              {!dashboard?.myRequests.length ? <p className="empty-rides small">{copy.noRequests}</p> : dashboard.myRequests.map((item) => (
                <article className="request-card" key={item.id}>
                  <div><strong>{item.driver_name}</strong><p>{item.area_name} · {formatDeparture(item.departure_at)}</p><small>{seatsLabel(item.seats_requested)}{item.driver_phone ? ` · ${copy.contact}: ${item.driver_phone}` : ''}</small></div>
                  <div className="request-status"><span className={`status ${item.status.toLowerCase()}`}>{item.status === 'ACCEPTED' ? copy.accepted : copy.requested}</span><button className="text-action danger" type="button" disabled={busy} onClick={() => void runAction(() => requestJson(`/api/requests/${item.id}`, { method: 'DELETE' }), copy.requestCancelled)}>{copy.cancelRequest}</button></div>
                </article>
              ))}
            </section>

            <section className="ride-management" aria-labelledby="incoming-title">
              <div className="rides-heading"><h3 id="incoming-title">{copy.incoming}</h3><span>{dashboard?.incomingRequests.length ?? 0}</span></div>
              {!dashboard?.incomingRequests.length ? <p className="empty-rides small">{copy.noIncoming}</p> : dashboard.incomingRequests.map((item) => {
                const ride = dashboard.rides.find((candidate) => candidate.id === item.ride_id);
                return (
                  <article className="request-card" key={item.id}>
                    <div><strong>{item.passenger_name}</strong><p>{ride?.area_name} · {seatsLabel(item.seats_requested)}</p>{item.passenger_phone && <small>{copy.contact}: {item.passenger_phone}</small>}</div>
                    {item.status === 'ACCEPTED' ? <span className="status accepted">{copy.accepted}</span> : <div className="inline-actions"><button className="button tiny-button" type="button" disabled={busy} onClick={() => void runAction(() => requestJson(`/api/requests/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ACCEPTED' }) }), copy.requestAccepted)}>{copy.accept}</button><button className="text-action danger" type="button" disabled={busy} onClick={() => void runAction(() => requestJson(`/api/requests/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) }), copy.requestRejected)}>{copy.reject}</button></div>}
                  </article>
                );
              })}
            </section>
          </div>
          <p className="privacy-note app-privacy"><span aria-hidden="true">◌</span>{copy.privacy}</p>
        </div>
      )}
      {notice && !guest && <p className={`ride-notice ${notice.kind}`} role="status">{notice.text}</p>}
    </section>
  );
}
