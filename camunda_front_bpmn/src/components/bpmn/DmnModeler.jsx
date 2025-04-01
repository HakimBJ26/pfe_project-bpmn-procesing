import React, { useEffect, useRef, useState } from 'react';
import DmnJS from 'dmn-js/lib/Modeler';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-font/dist/css/dmn.css';
import { Box, Paper, Button, Typography, CircularProgress, Alert, Divider, Stack, Snackbar } from '@mui/material';
import { FileUpload, Save, FileDownload } from '@mui/icons-material';
import { toast } from 'react-toastify';
import './DmnModeler.css';

const emptyDmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:camunda="http://camunda.org/schema/1.0/dmn" id="Definitions_1" name="Decision" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_1" name="Decision 1">
    <decisionTable id="decisionTable_1">
      <input id="input_1">
        <inputExpression id="inputExpression_1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_1">
      <dmndi:DMNShape id="DMNShape_1" dmnElementRef="Decision_1">
        <dc:Bounds height="80" width="180" x="150" y="150" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

const DmnModeler = () => {
  const containerRef = useRef(null);
  const [dmnJS, setDmnJS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef(null);

  // Initialize DMN modeler
  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new DmnJS({
      container: containerRef.current,
      keyboard: {
        bindTo: window
      }
    });

    // Subscribe to events
    modeler.on('import.done', (event) => {
      const { error } = event;

      if (error) {
        setError('Failed to render DMN: ' + error.message);
      } else {
        setError(null);

        // Access active viewer
        const activeViewer = modeler.getActiveViewer();

        // Set default zoom
        if (activeViewer && activeViewer.get) {
          const canvas = activeViewer.get('canvas');
          if (canvas && canvas.zoom) {
            canvas.zoom('fit-viewport');
          }
        }
      }

      setLoading(false);
    });

    // Import empty DMN
    modeler.importXML(emptyDmn);
    setDmnJS(modeler);

    return () => {
      modeler.destroy();
    };
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !dmnJS) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const xml = e.target?.result;
      if (typeof xml === 'string') {
        dmnJS.importXML(xml);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!dmnJS) return;

    try {
      const { xml } = await dmnJS.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decision.dmn';
      a.click();
      window.URL.revokeObjectURL(url);

      setSaveMessage('DMN file downloaded successfully');
    } catch (err) {
      console.error('Error saving DMN:', err);
      setError('Failed to save DMN file: ' + err.message);
    }
  };

  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Snackbar
        open={!!saveMessage}
        autoHideDuration={3000}
        onClose={() => setSaveMessage('')}
        message={saveMessage}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>DMN Decision Table Modeler</Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".dmn"
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={handleFileSelect}
            disabled={loading}
          >
            Import DMN
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleSave}
            disabled={loading}
          >
            Download DMN
          </Button>
          
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Paper>

      <Paper
        sx={{
          flex: 1,
          position: 'relative',
          minHeight: '600px'
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <div
          ref={containerRef}
          className="dmn-modeler-container"
        ></div>
      </Paper>
    </Box>
  );
};

export default DmnModeler;
