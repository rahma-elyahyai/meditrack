import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import {
  FaArrowLeft, FaFileMedical, FaPrint,
  FaPills, FaUserMd, FaUserInjured
} from 'react-icons/fa';

function DetailOrdonnance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordonnance, setOrdonnance] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    API.get(`/ordonnances/${id}`)
      .then(res => setOrdonnance(res.data.ordonnance))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Ordonnance — MediTrack</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', serif; background: #fff; color: #1a1a1a; padding: 32px; font-size: 13px; }
          .banner { background: #0a1e3c; color: #fff; padding: 24px 32px; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between; align-items: flex-start; }
          .banner h1 { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
          .banner .sub { color: rgba(255,255,255,0.55); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
          .banner .right { text-align: right; }
          .banner .right .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
          .banner .right .date { font-size: 15px; font-weight: 600; }
          .banner .right .validity { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; }
          .body { border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 4px 4px; padding: 32px; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid #f0f0f0; }
          .section-label { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 12px; }
          .avatar-row { display: flex; align-items: center; gap: 12px; }
          .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
          .avatar-blue { background: #E6F1FB; color: #0C447C; }
          .avatar-green { background: #E1F5EE; color: #085041; }
          .name { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
          .sub-info { font-size: 11px; color: #888; }
          .consult-box { background: #f4f8fb; border-left: 3px solid #2E86C1; padding: 12px 16px; border-radius: 0 4px 4px 0; margin-bottom: 24px; font-size: 12px; color: #2E86C1; }
          .consult-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #aaa; margin-bottom: 4px; }
          .med-title { font-weight: 600; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
          .med-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 4px; margin-bottom: 10px; }
          .med-num { width: 26px; height: 26px; border-radius: 50%; background: #0a1e3c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
          .med-name { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
          .med-dosage { font-weight: 400; color: #666; margin-left: 6px; }
          .badges { display: flex; gap: 8px; flex-wrap: wrap; }
          .badge { background: #fff; border: 1px solid #e8e8e8; padding: 3px 10px; border-radius: 3px; font-size: 11px; color: #555; }
          .instructions { font-size: 11px; color: #999; margin-top: 8px; font-style: italic; }
          .notes-box { background: #fffbf0; border-left: 3px solid #d97706; padding: 12px 16px; border-radius: 0 4px 4px 0; margin-bottom: 24px; }
          .notes-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #d97706; margin-bottom: 6px; }
          .notes-text { font-size: 12px; color: #555; font-style: italic; }
          .footer { padding-top: 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-end; }
          .footer-left { font-size: 11px; color: #bbb; line-height: 1.7; }
          .footer-right { text-align: right; }
          .sig-line { width: 120px; border-bottom: 1.5px solid #ccc; height: 48px; margin-left: auto; margin-bottom: 6px; }
          .sig-label { font-size: 10px; color: #aaa; }
          .sig-name { font-size: 12px; font-weight: 600; color: #444; margin-top: 3px; }
          .validity-warn { color: #d97706; font-size: 11px; margin-top: 4px; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm">Chargement de l'ordonnance...</p>
        </div>
      </div>
    );
  }

  if (!ordonnance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Ordonnance introuvable</p>
          <button onClick={() => navigate('/ordonnances')} className="mt-4 text-blue-600 hover:underline text-sm">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statutStyle = (s) => {
    switch (s) {
      case 'active':  return { bg: '#E1F5EE', color: '#085041', border: '#9FE1CB' };
      case 'expirée': return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
      case 'annulée': return { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' };
      default:        return { bg: '#f3f4f6', color: '#9ca3af', border: '#e5e7eb' };
    }
  };
  const statutLabel = (s) => ({ active: 'Active', expirée: 'Expirée', annulée: 'Annulée' }[s] || s);
  const ss = statutStyle(ordonnance.statut);

  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtShort = (d) => new Date(d).toLocaleDateString('fr-FR');

  return (
  <div style={{ padding: '40px 48px', minHeight: '100vh', background: '#f8f9fb', fontFamily: "'DM Sans', sans-serif" }}>
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

    {/* ✅ AJOUTER CE BLOC */}
    <style>{`
      .banner { background: #0a1e3c; color: #fff; padding: 24px 32px; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between; align-items: flex-start; }
      .banner h1 { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
      .banner .sub { color: rgba(255,255,255,0.55); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
      .banner .right { text-align: right; }
      .banner .right .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
      .banner .right .date { font-size: 15px; font-weight: 600; }
      .banner .right .validity { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; }
      .body { border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 4px 4px; padding: 32px; }
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid #f0f0f0; }
      .section-label { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 12px; }
      .avatar-row { display: flex; align-items: center; gap: 12px; }
      .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
      .avatar-blue { background: #E6F1FB; color: #0C447C; }
      .avatar-green { background: #E1F5EE; color: #085041; }
      .name { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
      .sub-info { font-size: 11px; color: #888; }
      .consult-box { background: #f4f8fb; border-left: 3px solid #2E86C1; padding: 12px 16px; border-radius: 0 4px 4px 0; margin-bottom: 24px; font-size: 12px; color: #2E86C1; }
      .consult-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #aaa; margin-bottom: 4px; }
      .med-title { font-weight: 600; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
      .med-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 4px; margin-bottom: 10px; }
      .med-num { width: 26px; height: 26px; border-radius: 50%; background: #0a1e3c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
      .med-name { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
      .med-dosage { font-weight: 400; color: #666; margin-left: 6px; }
      .badges { display: flex; gap: 8px; flex-wrap: wrap; }
      .badge { background: #fff; border: 1px solid #e8e8e8; padding: 3px 10px; border-radius: 3px; font-size: 11px; color: #555; }
      .instructions { font-size: 11px; color: #999; margin-top: 8px; font-style: italic; }
      .notes-box { background: #fffbf0; border-left: 3px solid #d97706; padding: 12px 16px; border-radius: 0 4px 4px 0; margin-bottom: 24px; }
      .notes-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #d97706; margin-bottom: 6px; }
      .notes-text { font-size: 12px; color: #555; font-style: italic; }
      .footer { padding-top: 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-end; }
      .footer-left { font-size: 11px; color: #bbb; line-height: 1.7; }
      .footer-right { text-align: right; }
      .sig-line { width: 120px; border-bottom: 1.5px solid #ccc; height: 48px; margin-left: auto; margin-bottom: 6px; }
      .sig-label { font-size: 10px; color: #aaa; }
      .sig-name { font-size: 12px; font-weight: 600; color: #444; margin-top: 3px; }
      .validity-warn { color: #d97706; font-size: 11px; margin-top: 4px; }
    `}</style>

      {/* Screen header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/ordonnances')}
            style={{ background: 'none', border: '1px solid #e8e8e8', borderRadius: 4, padding: '8px 10px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
          >
            <FaArrowLeft size={12} />
          </button>
          <div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: '#0a1e3c', margin: 0 }}>
              Détail de l'ordonnance
            </h2>
            <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>
              {fmtDate(ordonnance.date || ordonnance.createdAt)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 50, border: `1px solid ${ss.border}`, background: ss.bg, color: ss.color }}>
            {statutLabel(ordonnance.statut)}
          </span>
          <button
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0a1e3c', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = '#2E86C1'}
            onMouseLeave={e => e.currentTarget.style.background = '#0a1e3c'}
          >
            <FaPrint size={12} /> Imprimer
          </button>
        </div>
      </div>

      {/* Printable card */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div ref={printRef}>

          {/* Banner */}
          <div className="banner">
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>MediTrack</div>
              <div className="sub">Système de gestion médicale</div>
            </div>
            <div className="right">
              <div className="label">Ordonnance médicale</div>
              <div className="date">{fmtDate(ordonnance.date || ordonnance.createdAt)}</div>
              {ordonnance.validite && (
                <div className="validity">Valide jusqu'au {fmtShort(ordonnance.validite)}</div>
              )}
            </div>
          </div>

          <div className="body">
            {/* Patient + Médecin */}
            <div className="grid2">
              <div>
                <div className="section-label">Patient</div>
                <div className="avatar-row">
                  <div className="avatar avatar-blue">
                    {ordonnance.patient_id?.prenom?.[0]}{ordonnance.patient_id?.nom?.[0]}
                  </div>
                  <div>
                    <div className="name">{ordonnance.patient_id?.prenom} {ordonnance.patient_id?.nom}</div>
                    <div className="sub-info">{ordonnance.patient_id?.numero_dossier}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="section-label">Médecin prescripteur</div>
                <div className="avatar-row">
                  <div className="avatar avatar-green">
                    {ordonnance.medecin_id?.prenom?.[0]}{ordonnance.medecin_id?.nom?.[0]}
                  </div>
                  <div>
                    <div className="name">Dr. {ordonnance.medecin_id?.prenom} {ordonnance.medecin_id?.nom}</div>
                    {ordonnance.medecin_id?.specialite && (
                      <div className="sub-info">{ordonnance.medecin_id.specialite}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation liée */}
            {ordonnance.consultation_id && (
              <div className="consult-box" style={{ marginBottom: 24 }}>
                <div className="consult-label">Consultation liée</div>
                {ordonnance.consultation_id.motif} — {fmtShort(ordonnance.consultation_id.date)}
              </div>
            )}

            {/* Médicaments */}
            <div style={{ marginBottom: 24 }}>
              <div className="med-title">
                Médicaments prescrits ({ordonnance.medicaments?.length})
              </div>
              {ordonnance.medicaments?.map((m, i) => (
                <div key={i} className="med-item">
                  <div className="med-num">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="med-name">
                      {m.nom}
                      {m.dosage && <span className="med-dosage">— {m.dosage}</span>}
                    </div>
                    <div className="badges">
                      {m.frequence && <span className="badge">{m.frequence}</span>}
                      {m.duree     && <span className="badge">{m.duree}</span>}
                    </div>
                    {m.instructions && (
                      <div className="instructions">{m.instructions}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {ordonnance.notes && (
              <div className="notes-box" style={{ marginBottom: 24 }}>
                <div className="notes-label">Notes du médecin</div>
                <div className="notes-text">{ordonnance.notes}</div>
              </div>
            )}

            {/* Footer */}
            <div className="footer">
              <div className="footer-left">
                <div>Document généré le {fmtShort(new Date())}</div>
                {ordonnance.validite && (
                  <div className="validity-warn">Valide jusqu'au {fmtShort(ordonnance.validite)}</div>
                )}
              </div>
              <div className="footer-right">
                <div className="sig-line"></div>
                <div className="sig-label">Signature du médecin</div>
                <div className="sig-name">Dr. {ordonnance.medecin_id?.prenom} {ordonnance.medecin_id?.nom}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => navigate('/ordonnances')}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#aaa', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.target.style.color = '#555'}
            onMouseLeave={e => e.target.style.color = '#aaa'}
          >
            ← Retour à la liste des ordonnances
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailOrdonnance;