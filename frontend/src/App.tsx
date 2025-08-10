import { useState, useEffect } from 'react';
import { listFiles, uploadFile, downloadFile, getFileDetails } from './services/api';
import type { FileResponse } from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Format date to local string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
import './App.css';

function App() {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await listFiles();
      setFiles(response.files);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await uploadFile(file);
      toast.success(`Successfully uploaded ${file.name}`, {
        position: "top-right",
        autoClose: 3000
      });
      await loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload ${file.name}`, {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      await downloadFile(fileId);
      toast.success(`Downloading ${filename}`, {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download ${filename}`, {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const handleShowDetails = async (fileId: string) => {
    try {
      const details = await getFileDetails(fileId);
      setSelectedFile(details);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching file details:', error);
      toast.error('Failed to fetch file details');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '2rem'
    }}>
      <ToastContainer />
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <h1 style={{ 
          color: 'white',
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: '600',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>Simple File Storage</h1>
        
        {loading ? (
          <div style={{ 
            color: 'white', 
            textAlign: 'center',
            padding: '2rem',
            fontSize: '1.2rem'
          }}>Loading...</div>
        ) : (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px'
            }}>
              <input
                type="file"
                onChange={handleFileUpload}
                className="file-input"
                id="file-upload"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="file-upload" 
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-block',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  }
                }}
              >
                Upload File
              </label>
            </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            padding: '0.5rem'
          }}>
            {files.map((file) => (
              <div 
                key={file.id} 
                onClick={() => handleShowDetails(file.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: 'white', 
                      fontWeight: '500',
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem',
                      wordBreak: 'break-word'
                    }}>{file.filename}</div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        color: '#90CAF9',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>{file.content_type}</span>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem'
                      }}>{formatDate(file.upload_date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file.id, file.filename);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                      whiteSpace: 'nowrap',
                      minWidth: '120px',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}

            {files.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.7)',
                gridColumn: '1 / -1',
                padding: '4rem 2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '2px dashed rgba(255, 255, 255, 0.1)',
                fontSize: '1.1rem'
              }}>
                No files uploaded yet. Click the upload button to get started!
              </div>
            )}
          </div>
        </>
      )}
      </div>

      {/* File Details Modal */}
      {showModal && selectedFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }} onClick={() => setShowModal(false)}>
          <div 
            style={{
              background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            <h2 style={{
              color: 'white',
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '0.5rem'
            }}>File Details</h2>

            <div style={{
              display: 'grid',
              gap: '1rem',
              color: 'white'
            }}>
              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Filename
                </div>
                <div style={{ wordBreak: 'break-all' }}>{selectedFile.filename}</div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Type
                </div>
                <div>{selectedFile.content_type}</div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  File Path
                </div>
                <div style={{ wordBreak: 'break-all' }}>{selectedFile.file_path}</div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Upload Date
                </div>
                <div>{formatDate(selectedFile.upload_date)}</div>
              </div>

              <button
                onClick={() => handleDownload(selectedFile.id, selectedFile.filename)}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginTop: '1rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                }}
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
