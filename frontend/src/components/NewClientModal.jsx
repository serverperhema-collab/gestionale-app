import React from 'react';

const NewClientModal = ({ showNewClienteModal, setShowNewClienteModal, handleCreateCliente }) => {
  return (
    <>
      {/* 2. NEW CLIENT MODAL */}
      {showNewClienteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form onSubmit={handleCreateCliente}>
              <div className="modal-header">
                <h2>Nuova Anagrafica Cliente</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewClienteModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Nome Locale / Azienda *</label>
                  <input type="text" name="nome_locale" className="form-control" required placeholder="Es: Ristorante Da Gianni" />
                </div>
                <div className="form-group">
                  <label>Partita IVA</label>
                  <input type="text" name="piva" className="form-control" placeholder="11 cifre" />
                </div>
                <div className="form-group">
                  <label>Sede Legale</label>
                  <input type="text" name="sede_legale" className="form-control" placeholder="Indirizzo legale" />
                </div>
                <div className="form-group">
                  <label>Sede Operativa / Lavoro</label>
                  <input type="text" name="sede_lavoro" className="form-control" placeholder="Indirizzo di lavoro" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Referente Contatto</label>
                    <input type="text" name="referente" className="form-control" placeholder="Referente locale" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" placeholder="info@locale.it" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Telefono Mobile</label>
                    <input type="text" name="telefono_mobile" className="form-control" placeholder="Numero cellulare" />
                  </div>
                  <div className="form-group">
                    <label>Telefono Fisso</label>
                    <input type="text" name="telefono_fisso" className="form-control" placeholder="Telefono fisso" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewClienteModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">➕ Salva Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default NewClientModal;
