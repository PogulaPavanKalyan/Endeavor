import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const Dashboard = () => {
  const { conferences, activeConferenceId, metrics } = useAdmin();
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(false);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      setLoadingDiag(true);
      try {
        const data = await api.get('/api/admin/diagnostics');
        setDiagnostics(data);
      } catch (e) {
        console.error("Failed to fetch diagnostics:", e);
      } finally {
        setLoadingDiag(false);
      }
    };
    fetchDiagnostics();
  }, []);

  const totalConfs = conferences.length;
  const publishedConfs = conferences.filter(c => c.status === 'PUBLISHED').length || totalConfs;
  const upcomingConfs = conferences.filter(c => {
    if (!c.startDate) return false;
    return new Date(c.startDate) > new Date();
  }).length;

  const recentActivities = [
    { color: 'var(--admin-success)', text: <><strong>New Registration</strong> received for Food Science 2027</>, time: '2 hours ago' },
    { color: 'var(--admin-primary)', text: <><strong>Dr. Sarah Higgins</strong> was added as Keynote Speaker</>, time: '5 hours ago' },
    { color: 'var(--admin-warning)', text: <><strong>Abstract #47</strong> submitted — pending review</>, time: '1 day ago' },
    { color: 'var(--admin-info)', text: <><strong>Nursing 2027</strong> conference published</>, time: '2 days ago' },
    { color: 'var(--admin-danger)', text: <><strong>Contact inquiry</strong> from John Smith — requires response</>, time: '3 days ago' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's an overview of your conference platform.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => navigate('/admin/conferences')}>
          + Create Conference
        </button>
      </div>

      {/* Metric Cards */}
      <div className="admin-metrics-grid">
        <div className="metric-card" onClick={() => navigate('/admin/conferences')}>
          <div className="metric-icon metric-icon-primary">🏢</div>
          <div className="metric-content">
            <div className="metric-label">Total Conferences</div>
            <div className="metric-value">{totalConfs}</div>
            <div className="metric-trend metric-trend-up">↑ {publishedConfs} active</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/admin/speakers')}>
          <div className="metric-icon metric-icon-success">🎙️</div>
          <div className="metric-content">
            <div className="metric-label">Total Speakers</div>
            <div className="metric-value">{metrics.speakers}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/admin/registrations')}>
          <div className="metric-icon metric-icon-warning">🎟️</div>
          <div className="metric-content">
            <div className="metric-label">Registrations</div>
            <div className="metric-value">{metrics.registrations}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/admin/abstracts')}>
          <div className="metric-icon metric-icon-info">📄</div>
          <div className="metric-content">
            <div className="metric-label">Abstracts</div>
            <div className="metric-value">{metrics.abstracts}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon-primary">📅</div>
          <div className="metric-content">
            <div className="metric-label">Upcoming</div>
            <div className="metric-value">{upcomingConfs}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/admin/contacts')}>
          <div className="metric-icon metric-icon-danger">✉️</div>
          <div className="metric-content">
            <div className="metric-label">Inquiries</div>
            <div className="metric-value">{metrics.contacts}</div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Activity & System Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recent Activity */}
          <div className="admin-card">
            <div className="dashboard-section-title">🕐 Recent Activity</div>
            <div className="activity-list">
              {recentActivities.map((item, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" style={{ background: item.color }} />
                  <div>
                    <div className="activity-text">{item.text}</div>
                    <div className="activity-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostics Card */}
          <div className="admin-card">
            <div className="dashboard-section-title">🔍 System Diagnostics & Health</div>
            {loadingDiag ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading diagnostics...</div>
            ) : diagnostics ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    background: diagnostics.orphanedConferencePhotosCount > 0 ? '#fdf2f2' : '#f0fdf4',
                    border: diagnostics.orphanedConferencePhotosCount > 0 ? '1px solid #fecdca' : '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>🖼️</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Orphaned Conf Photos</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: diagnostics.orphanedConferencePhotosCount > 0 ? '#b91c1c' : '#15803d' }}>
                        {diagnostics.orphanedConferencePhotosCount}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: diagnostics.orphanedSpeakerPhotosCount > 0 ? '#fdf2f2' : '#f0fdf4',
                    border: diagnostics.orphanedSpeakerPhotosCount > 0 ? '1px solid #fecdca' : '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>🎙️</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Orphaned Speaker Photos</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: diagnostics.orphanedSpeakerPhotosCount > 0 ? '#b91c1c' : '#15803d' }}>
                        {diagnostics.orphanedSpeakerPhotosCount}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: diagnostics.orphanedSponsorImagesCount > 0 ? '#fdf2f2' : '#f0fdf4',
                    border: diagnostics.orphanedSponsorImagesCount > 0 ? '1px solid #fecdca' : '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>🤝</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Orphaned Sponsor Images</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: diagnostics.orphanedSponsorImagesCount > 0 ? '#b91c1c' : '#15803d' }}>
                        {diagnostics.orphanedSponsorImagesCount}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: diagnostics.duplicateRegistrationsCount > 0 ? '#fffbeb' : '#f0fdf4',
                    border: diagnostics.duplicateRegistrationsCount > 0 ? '1px solid #fde68a' : '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>🎟️</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Duplicate Registrations</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: diagnostics.duplicateRegistrationsCount > 0 ? '#b45309' : '#15803d' }}>
                        {diagnostics.duplicateRegistrationsCount}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: diagnostics.missingAbstractFilesCount > 0 ? '#fdf2f2' : '#f0fdf4',
                    border: diagnostics.missingAbstractFilesCount > 0 ? '1px solid #fecdca' : '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>📄</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Abstracts Missing Files</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: diagnostics.missingAbstractFilesCount > 0 ? '#b91c1c' : '#15803d' }}>
                        {diagnostics.missingAbstractFilesCount}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: diagnostics.incompleteSessionsCount > 0 ? '#fdf2f2' : '#f0fdf4',
                    border: diagnostics.incompleteSessionsCount > 0 ? '1px solid #fecdca' : '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>🕒</span>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Incomplete Sessions</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: diagnostics.incompleteSessionsCount > 0 ? '#b91c1c' : '#15803d' }}>
                        {diagnostics.incompleteSessionsCount}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '8px',
                  padding: '10px 12px',
                  background: 'var(--admin-bg)',
                  border: '1px solid var(--admin-border-subtle)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--admin-text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Total Conferences: <strong>{diagnostics.totalConferences}</strong></span>
                  <span>Active: <strong style={{ color: 'var(--admin-success)' }}>{diagnostics.totalActiveConferences}</strong></span>
                  <span>Archived: <strong style={{ color: 'var(--admin-text-muted)' }}>{diagnostics.totalArchivedConferences}</strong></span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No diagnostics data available.</div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions + Upcoming Conferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card">
            <div className="dashboard-section-title">⚡ Quick Actions</div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate('/admin/conferences')}>
                <span>🏢</span><span>New Conference</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/speakers')}>
                <span>🎙️</span><span>Add Speaker</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/program')}>
                <span>📋</span><span>Manage Program</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/registrations')}>
                <span>📊</span><span>Export Data</span>
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="dashboard-section-title">📅 Upcoming Conferences</div>
            {conferences.filter(c => c.startDate && new Date(c.startDate) > new Date()).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-text-muted)', fontSize: '13px' }}>
                No upcoming conferences
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conferences
                  .filter(c => c.startDate && new Date(c.startDate) > new Date())
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .slice(0, 4)
                  .map(conf => (
                    <div key={conf.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', background: 'var(--admin-bg)',
                      borderRadius: '8px', border: '1px solid var(--admin-border-subtle)'
                    }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '8px',
                        background: 'var(--admin-primary-soft)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--admin-primary)', lineHeight: 1 }}>
                          {new Date(conf.startDate).getDate()}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--admin-primary)', textTransform: 'uppercase' }}>
                          {new Date(conf.startDate).toLocaleString('en', { month: 'short' })}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conf.tittle || conf.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                          {conf.venue || 'Venue TBA'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

