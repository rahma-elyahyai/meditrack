import { useEffect, useState } from 'react';
import { getRendezVous, ajouterRendezVous, modifierRendezVous, getPatients, getMedecins } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import {
  FaCalendarAlt, FaPlus, FaSearch, FaCheck, FaTimes,
  FaClock, FaFilter, FaThList, FaCalendar,
  FaUserMd, FaChevronLeft, FaChevronRight, FaUserInjured, FaPhone
} from 'react-icons/fa';

const JOURS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const FORM0   = { patient_id:'', medecin_id:'', date:'', heure:'', duree:'30', motif:'', statut:'planifié', notes:'' };

const STATUT = {
  planifié: { bg:'#EFF6FF', text:'#1D4ED8', border:'#BFDBFE', bar:'#60A5FA', label:'Planifié' },
  confirmé: { bg:'#F0FDF4', text:'#166534', border:'#BBF7D0', bar:'#4ADE80', label:'Confirmé' },
  annulé:   { bg:'#FEF2F2', text:'#991B1B', border:'#FECACA', bar:'#F87171', label:'Annulé'   },
  terminé:  { bg:'#F9FAFB', text:'#6B7280', border:'#E5E7EB', bar:'#D1D5DB', label:'Terminé'  },
};

const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }); }
  catch { return '—'; }
};
const fmtShort = (d) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return '—'; } };

export default function RendezVous() {
  const { user } = useAuth();
  const isMedecin = user?.role === 'medecin';
  const isAdmin   = user?.role === 'admin';

  const [rdvList,       setRdvList]       = useState([]);
  const [patients,      setPatients]      = useState([]);
  const [medecins,      setMedecins]      = useState([]);
  const [search,        setSearch]        = useState('');
  const [filtre,        setFiltre]        = useState('tous');
  const [vue,           setVue]           = useState('liste');
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [calDate,       setCalDate]       = useState(new Date());
  const [form,          setForm]          = useState(FORM0);
  const [erreur,        setErreur]        = useState('');
  const [loadingForm,   setLoadingForm]   = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getRendezVous();   // backend filtre déjà si médecin
      setRdvList(res.data.rendezVous);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    charger();
    getPatients().then(r => setPatients(r.data.patients || [])).catch(console.error);
    if (!isMedecin) {
      getMedecins().then(r => setMedecins(r.data.medecins || r.data.utilisateurs || [])).catch(console.error);
    }
  }, []);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

// Ajoute temporairement en haut du composant

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('USER:', user);
console.log('user._id:', user?._id);
console.log('isMedecin:', isMedecin);
const medecin_id = isMedecin ? (user._id || user.id) : form.medecin_id;

  if (!form.patient_id || !form.date || !form.heure) {
    return setErreur('Patient, date et heure sont obligatoires');
  }
  if (!medecin_id) {
    return setErreur('Veuillez sélectionner un médecin');
  }
    setLoadingForm(true); setErreur('');
    try {
      await ajouterRendezVous({ ...form, medecin_id });
      setShowModal(false); setForm(FORM0); charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally { setLoadingForm(false); }
  };

  const changerStatut = async (id, statut) => {
    setActionLoading(id + statut);
    try { await modifierRendezVous(id, { statut }); charger(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const rdvFiltres = rdvList.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      r.patient_id?.nom?.toLowerCase().includes(q) ||
      r.patient_id?.prenom?.toLowerCase().includes(q) ||
      r.motif?.toLowerCase().includes(q);
    return matchSearch && (filtre === 'tous' || r.statut === filtre);
  });

  const rdvParDate = rdvFiltres.reduce((acc, rdv) => {
    const k = fmtDate(rdv.date);
    if (!acc[k]) acc[k] = [];
    acc[k].push(rdv);
    return acc;
  }, {});

  // Stats
  const total     = rdvList.length;
  const planifies = rdvList.filter(r => r.statut === 'planifié').length;
  const confirmes = rdvList.filter(r => r.statut === 'confirmé').length;
  const annules   = rdvList.filter(r => r.statut === 'annulé').length;

  // Prochain RDV (pour médecin)
  const now = new Date();
  const prochain = isMedecin
    ? rdvList
        .filter(r => new Date(r.date) >= now && r.statut !== 'annulé' && r.statut !== 'terminé')
        .sort((a,b) => new Date(a.date) - new Date(b.date))[0]
    : null;

  // Calendrier
  const annee = calDate.getFullYear();
  const mois  = calDate.getMonth();
  const premierJour = new Date(annee, mois, 1).getDay();
  const decalage = premierJour === 0 ? 6 : premierJour - 1;
  const nbJours  = new Date(annee, mois + 1, 0).getDate();
  const rdvCal = {};
  rdvList.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === annee && d.getMonth() === mois) {
      const j = d.getDate();
      if (!rdvCal[j]) rdvCal[j] = [];
      rdvCal[j].push(r);
    }
  });
  const today = new Date();

  const S = {
    page:    { padding:'32px 40px', minHeight:'100vh', background:'#F8F9FB', fontFamily:"'DM Sans', sans-serif" },
    topBar:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 },
    title:   { fontFamily:'Georgia,serif', fontSize:22, fontWeight:600, color:'#0a1e3c', margin:0 },
    sub:     { fontSize:13, color:'#aaa', margin:'5px 0 0' },
    btnPrim: { display:'flex', alignItems:'center', gap:8, background:'#0a1e3c', color:'#fff', border:'none', padding:'10px 20px', borderRadius:4, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    btnSec:  { background:'none', border:'1px solid #e0e0e0', borderRadius:4, padding:'9px 14px', fontSize:12, fontWeight:500, cursor:'pointer', color:'#555', fontFamily:"'DM Sans',sans-serif" },
    card:    { background:'#fff', borderRadius:6, border:'1px solid #eee', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' },
  };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>

      {/* ── HEADER ── */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.title}>
            {isMedecin ? `Mes rendez-vous` : 'Rendez-vous'}
          </h1>
          <p style={S.sub}>
            {isMedecin
              ? `Dr. ${user.prenom} ${user.nom} — ${total} rendez-vous`
              : `${total} rendez-vous enregistrés`}
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {/* Toggle liste / calendrier */}
          <div style={{ display:'flex', border:'1px solid #e0e0e0', borderRadius:4, overflow:'hidden', background:'#fff' }}>
            {[['liste','Liste'],['calendrier','Calendrier']].map(([k,l]) => (
              <button key={k} onClick={() => setVue(k)} style={{
                padding:'9px 16px', fontSize:12, fontWeight:500, border:'none', cursor:'pointer',
                background: vue===k ? '#0a1e3c' : 'transparent',
                color: vue===k ? '#fff' : '#666',
                fontFamily:"'DM Sans',sans-serif",
              }}>{l}</button>
            ))}
          </div>
          <button style={S.btnPrim} onClick={() => setShowModal(true)}
            onMouseEnter={e => e.currentTarget.style.background='#2E86C1'}
            onMouseLeave={e => e.currentTarget.style.background='#0a1e3c'}>
            <FaPlus size={11}/> Nouveau RDV
          </button>
        </div>
      </div>

      {/* ── PROCHAIN RDV (médecin seulement) ── */}
      {isMedecin && prochain && (
        <div style={{ ...S.card, padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'3px solid #2E86C1' }}>
          <div>
            <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#2E86C1', fontWeight:600, margin:'0 0 6px' }}>Prochain rendez-vous</p>
            <p style={{ fontSize:15, fontWeight:600, color:'#0a1e3c', margin:'0 0 4px' }}>
              {prochain.patient_id?.prenom} {prochain.patient_id?.nom}
            </p>
            <p style={{ fontSize:13, color:'#888', margin:0 }}>
              {fmtShort(prochain.date)} à {prochain.heure} · {prochain.duree} min
              {prochain.motif && ` · ${prochain.motif}`}
            </p>
          </div>
          <span style={{ fontSize:12, fontWeight:500, padding:'5px 14px', borderRadius:50, background: STATUT[prochain.statut]?.bg, color: STATUT[prochain.statut]?.text, border:`1px solid ${STATUT[prochain.statut]?.border}` }}>
            {STATUT[prochain.statut]?.label}
          </span>
        </div>
      )}

      {/* ── STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Total',     value:total,     color:'#0a1e3c', bg:'#EEF2FF' },
          { label:'Planifiés', value:planifies,  color:'#1D4ED8', bg:'#EFF6FF' },
          { label:'Confirmés', value:confirmes,  color:'#166534', bg:'#F0FDF4' },
          { label:'Annulés',   value:annules,    color:'#991B1B', bg:'#FEF2F2' },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:6, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:s.color }}>{s.value}</div>
            <p style={{ fontSize:13, color:'#888', margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══ VUE LISTE ══ */}
      {vue === 'liste' ? (
        <>
          {/* Recherche + filtres */}
          <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ position:'relative', flex:1, minWidth:220 }}>
              <FaSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#bbb', fontSize:12 }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Rechercher patient, motif..."
                style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px 10px 34px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
                onFocus={e=>e.target.style.borderColor='#2E86C1'}
                onBlur={e=>e.target.style.borderColor='#e0e0e0'}
              />
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {['tous','planifié','confirmé','annulé','terminé'].map(f => (
                <button key={f} onClick={()=>setFiltre(f)} style={{
                  padding:'8px 14px', borderRadius:4, fontSize:12, fontWeight:500, border:'1px solid',
                  borderColor: filtre===f ? '#0a1e3c' : '#e0e0e0',
                  background: filtre===f ? '#0a1e3c' : '#fff',
                  color: filtre===f ? '#fff' : '#666',
                  cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textTransform:'capitalize',
                }}>{f === 'tous' ? 'Tous' : f}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#bbb', fontSize:14 }}>Chargement...</div>
          ) : Object.keys(rdvParDate).length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <FaCalendarAlt style={{ fontSize:40, color:'#e0e0e0', marginBottom:12 }}/>
              <p style={{ color:'#aaa', fontSize:14 }}>Aucun rendez-vous trouvé</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
              {Object.entries(rdvParDate).map(([date, rdvs]) => (
                <div key={date}>
                  {/* Date header */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div style={{ background:'#0a1e3c', color:'#fff', padding:'5px 14px', borderRadius:4, fontSize:12, fontWeight:600, textTransform:'capitalize' }}>{date}</div>
                    <div style={{ flex:1, height:1, background:'#f0f0f0' }}/>
                    <span style={{ fontSize:12, color:'#bbb' }}>{rdvs.length} RDV</span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {rdvs.map(rdv => {
                      const st = STATUT[rdv.statut] || STATUT.planifié;
                      return (
                        <div key={rdv._id} style={{ ...S.card, overflow:'hidden', display:'flex' }}>
                          {/* Barre colorée */}
                          <div style={{ width:4, background:st.bar, flexShrink:0 }}/>
                          <div style={{ flex:1, padding:'16px 18px' }}>
                            {/* Top */}
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:36, height:36, borderRadius:'50%', background:'#E6F1FB', color:'#0C447C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>
                                  {rdv.patient_id?.prenom?.[0]}{rdv.patient_id?.nom?.[0]}
                                </div>
                                <div>
                                  <p style={{ fontWeight:600, fontSize:14, color:'#0a1e3c', margin:0 }}>
                                    {rdv.patient_id?.prenom} {rdv.patient_id?.nom}
                                  </p>
                                  {!isMedecin && (
                                    <p style={{ fontSize:12, color:'#aaa', margin:'3px 0 0', display:'flex', alignItems:'center', gap:4 }}>
                                      <FaUserMd size={10}/> Dr. {rdv.medecin_id?.prenom} {rdv.medecin_id?.nom}
                                    </p>
                                  )}
                                  {rdv.patient_id?.telephone && (
                                    <p style={{ fontSize:11, color:'#bbb', margin:'2px 0 0', display:'flex', alignItems:'center', gap:4 }}>
                                      <FaPhone size={9}/> {rdv.patient_id.telephone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize:11, fontWeight:500, padding:'4px 12px', borderRadius:50, background:st.bg, color:st.text, border:`1px solid ${st.border}`, whiteSpace:'nowrap' }}>
                                {st.label}
                              </span>
                            </div>

                            {/* Infos */}
                            <div style={{ display:'flex', gap:16, fontSize:12, color:'#888', marginBottom:12 }}>
                              <span>🕐 {rdv.heure}</span>
                              <span>⏱ {rdv.duree} min</span>
                              {rdv.motif && <span>📋 {rdv.motif}</span>}
                            </div>

                            {rdv.notes && (
                              <p style={{ fontSize:12, color:'#aaa', fontStyle:'italic', background:'#fafafa', padding:'8px 12px', borderRadius:4, margin:'0 0 12px' }}>
                                {rdv.notes}
                              </p>
                            )}

                            {/* Actions */}
                            {rdv.statut !== 'annulé' && rdv.statut !== 'terminé' && (
                              <div style={{ display:'flex', gap:8, paddingTop:10, borderTop:'1px solid #f5f5f5' }}>
                                {rdv.statut === 'planifié' && (
                                  <button onClick={() => changerStatut(rdv._id, 'confirmé')}
                                    disabled={actionLoading === rdv._id+'confirmé'}
                                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'#F0FDF4', color:'#166534', border:'1px solid #BBF7D0', borderRadius:4, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                                    <FaCheck size={10}/> Confirmer
                                  </button>
                                )}
                                {rdv.statut === 'confirmé' && (
                                  <button onClick={() => changerStatut(rdv._id, 'terminé')}
                                    disabled={actionLoading === rdv._id+'terminé'}
                                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'#F9FAFB', color:'#374151', border:'1px solid #E5E7EB', borderRadius:4, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                                    <FaCheck size={10}/> Terminer
                                  </button>
                                )}
                                <button onClick={() => changerStatut(rdv._id, 'annulé')}
                                  disabled={actionLoading === rdv._id+'annulé'}
                                  style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'#FEF2F2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:4, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                                  <FaTimes size={10}/> Annuler
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ══ VUE CALENDRIER ══ */
        <div style={S.card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid #f0f0f0' }}>
            <button onClick={() => setCalDate(new Date(annee,mois-1,1))} style={{ background:'none', border:'1px solid #e0e0e0', borderRadius:4, padding:'6px 10px', cursor:'pointer', color:'#666' }}><FaChevronLeft size={11}/></button>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:16, fontWeight:600, color:'#0a1e3c', margin:0 }}>{MOIS_FR[mois]} {annee}</h3>
            <button onClick={() => setCalDate(new Date(annee,mois+1,1))} style={{ background:'none', border:'1px solid #e0e0e0', borderRadius:4, padding:'6px 10px', cursor:'pointer', color:'#666' }}><FaChevronRight size={11}/></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid #f5f5f5' }}>
            {JOURS.map(j => (
              <div key={j} style={{ padding:'12px 0', textAlign:'center', fontSize:11, fontWeight:600, color:'#bbb', letterSpacing:1, textTransform:'uppercase' }}>{j}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {Array.from({length:decalage}).map((_,i) => (
              <div key={`e-${i}`} style={{ minHeight:100, borderRight:'1px solid #f5f5f5', borderBottom:'1px solid #f5f5f5', background:'#fafafa' }}/>
            ))}
            {Array.from({length:nbJours}).map((_,i) => {
              const jour = i+1;
              const rdvs = rdvCal[jour] || [];
              const isToday = today.getDate()===jour && today.getMonth()===mois && today.getFullYear()===annee;
              return (
                <div key={jour} style={{ minHeight:100, borderRight:'1px solid #f5f5f5', borderBottom:'1px solid #f5f5f5', padding:'8px 6px', background: isToday ? '#EFF6FF' : '#fff' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background: isToday ? '#0a1e3c' : 'transparent', color: isToday ? '#fff' : '#555', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, marginBottom:4 }}>{jour}</div>
                  {rdvs.slice(0,3).map((r,idx) => {
                    const st = STATUT[r.statut] || STATUT.planifié;
                    return (
                      <div key={idx} style={{ fontSize:10, padding:'2px 6px', borderRadius:3, background:st.bg, color:st.text, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                        title={`${r.heure} — ${r.patient_id?.prenom} ${r.patient_id?.nom}`}>
                        {r.heure} {r.patient_id?.nom}
                      </div>
                    );
                  })}
                  {rdvs.length > 3 && <div style={{ fontSize:10, color:'#bbb', paddingLeft:4 }}>+{rdvs.length-3}</div>}
                </div>
              );
            })}
          </div>
          {/* Légende */}
          <div style={{ display:'flex', gap:20, padding:'14px 24px', borderTop:'1px solid #f5f5f5' }}>
            {Object.entries(STATUT).map(([k,v]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:v.bg, border:`1px solid ${v.border}` }}/>
                <span style={{ fontSize:11, color:'#888' }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div style={{ background:'#fff', borderRadius:6, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            {/* Header modal */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #f0f0f0' }}>
              <div>
                <h3 style={{ fontFamily:'Georgia,serif', fontSize:17, fontWeight:600, color:'#0a1e3c', margin:0 }}>Nouveau rendez-vous</h3>
                {isMedecin && <p style={{ fontSize:12, color:'#aaa', margin:'4px 0 0' }}>Dr. {user.prenom} {user.nom}</p>}
              </div>
              <button onClick={()=>{setShowModal(false);setErreur('');setForm(FORM0);}} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:16 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:'24px', display:'flex', flexDirection:'column', gap:18 }}>
              {erreur && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderLeft:'3px solid #EF4444', padding:'10px 14px', borderRadius:4, fontSize:13, color:'#991B1B' }}>{erreur}</div>
              )}

              {/* Patient */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>PATIENT <span style={{color:'#ef4444'}}>*</span></label>
                <select value={form.patient_id} onChange={set('patient_id')} required
                  style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', background:'#fff' }}
                  onFocus={e=>e.target.style.borderColor='#2E86C1'}
                  onBlur={e=>e.target.style.borderColor='#e0e0e0'}>
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.prenom} {p.nom} — {p.numero_dossier}</option>)}
                </select>
              </div>

              {/* Médecin — masqué pour médecin connecté */}
              {!isMedecin ? (
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>MÉDECIN <span style={{color:'#ef4444'}}>*</span></label>
                  <select value={form.medecin_id} onChange={set('medecin_id')} required
                    style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', background:'#fff' }}
                    onFocus={e=>e.target.style.borderColor='#2E86C1'}
                    onBlur={e=>e.target.style.borderColor='#e0e0e0'}>
                    <option value="">-- Sélectionner un médecin --</option>
                    {medecins.map(m => <option key={m._id} value={m._id}>Dr. {m.prenom} {m.nom}{m.specialite ? ` — ${m.specialite}` : ''}</option>)}
                  </select>
                </div>
              ) : (
                <div style={{ padding:'10px 14px', background:'#EFF6FF', borderRadius:4, fontSize:13, color:'#1D4ED8', display:'flex', alignItems:'center', gap:8 }}>
                  <FaUserMd size={13}/> Assigné à Dr. {user.prenom} {user.nom}
                </div>
              )}

              {/* Date + Heure */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[['date','DATE','date'],['heure','HEURE','time']].map(([f,l,t]) => (
                  <div key={f}>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>{l} <span style={{color:'#ef4444'}}>*</span></label>
                    <input type={t} value={form[f]} onChange={set(f)} required
                      style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
                      onFocus={e=>e.target.style.borderColor='#2E86C1'}
                      onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                  </div>
                ))}
              </div>

              {/* Durée + Statut */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>DURÉE</label>
                  <select value={form.duree} onChange={set('duree')}
                    style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', background:'#fff' }}>
                    {[['15','15 min'],['30','30 min'],['45','45 min'],['60','1 heure'],['90','1h30']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>STATUT</label>
                  <select value={form.statut} onChange={set('statut')}
                    style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', background:'#fff' }}>
                    <option value="planifié">Planifié</option>
                    <option value="confirmé">Confirmé</option>
                    <option value="annulé">Annulé</option>
                  </select>
                </div>
              </div>

              {/* Motif */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>MOTIF</label>
                <input type="text" value={form.motif} onChange={set('motif')} placeholder="Ex : Contrôle, suivi traitement..."
                  style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
                  onFocus={e=>e.target.style.borderColor='#2E86C1'}
                  onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6, letterSpacing:0.5 }}>NOTES</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Informations supplémentaires..."
                  style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:4, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', resize:'none' }}
                  onFocus={e=>e.target.style.borderColor='#2E86C1'}
                  onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
              </div>

              {/* Boutons */}
              <div style={{ display:'flex', gap:12, paddingTop:4 }}>
                <button type="button" onClick={()=>{setShowModal(false);setErreur('');setForm(FORM0);}}
                  style={{ flex:1, padding:'12px', border:'1px solid #e0e0e0', borderRadius:4, background:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', color:'#555', fontFamily:"'DM Sans',sans-serif" }}>
                  Annuler
                </button>
                <button type="submit" disabled={loadingForm}
                  style={{ flex:1, padding:'12px', border:'none', borderRadius:4, background: loadingForm ? '#93C5FD' : '#0a1e3c', color:'#fff', fontSize:13, fontWeight:500, cursor: loadingForm ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e=>{ if(!loadingForm) e.target.style.background='#2E86C1'; }}
                  onMouseLeave={e=>{ if(!loadingForm) e.target.style.background='#0a1e3c'; }}>
                  {loadingForm ? 'Enregistrement...' : 'Confirmer le RDV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}