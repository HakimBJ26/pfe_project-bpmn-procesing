import React, { useEffect, useRef, useState } from 'react';
import DmnModeler from 'dmn-js/lib/Modeler';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn.css';
import { Button, message, Modal, Input, Space, Tooltip } from 'antd';
import { SaveOutlined, DeploymentUnitOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dmnService from '../../services/dmnService';

import './DmnEditor.css';

// Modèle DMN par défaut pour initialiser une nouvelle table de décision
const DEFAULT_DMN = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" 
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" 
             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" 
             xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/" 
             xmlns:camunda="http://camunda.org/schema/1.0/dmn" 
             id="definitions" 
             name="definitions" 
             namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="decision" name="New Decision">
    <decisionTable id="decisionTable">
      <input id="input1" label="Input 1">
        <inputExpression id="inputExpression1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="output1" label="Output 1" name="output1" typeRef="string" />
      <rule id="rule1">
        <inputEntry id="inputEntry1">
          <text>"value1"</text>
        </inputEntry>
        <outputEntry id="outputEntry1">
          <text>"result1"</text>
        </outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_1">
      <dmndi:DMNShape id="DMNShape_1" dmnElementRef="decision">
        <dc:Bounds height="80" width="180" x="150" y="150" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

const DmnEditor = ({ dmnId, initialDmn = DEFAULT_DMN, onSave }) => {
  const containerRef = useRef(null);
  const [dmnModeler, setDmnModeler] = useState(null);
  const [dmnName, setDmnName] = useState('New Decision Table');
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dmnXml, setDmnXml] = useState(initialDmn);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialiser l'éditeur DMN
    const modeler = new DmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: window
      }
    });

    // Importer le diagramme DMN
    modeler.importXML(initialDmn).catch(err => {
      console.error('Erreur lors de l\'importation du DMN', err);
      message.error('Erreur lors du chargement du DMN');
    });

    setDmnModeler(modeler);

    // Nettoyage lors du démontage du composant
    return () => modeler.destroy();
  }, [initialDmn]);

  // Charger le DMN existant si un ID est fourni
  useEffect(() => {
    if (dmnId) {
      const loadDmn = async () => {
        try {
          const dmn = await dmnService.getDmnById(dmnId);
          setDmnName(dmn.name);
          
          if (dmn.content && dmnModeler) {
            dmnModeler.importXML(dmn.content);
            setDmnXml(dmn.content);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du DMN', error);
          message.error('Impossible de charger le DMN');
        }
      };
      
      loadDmn();
    }
  }, [dmnId, dmnModeler]);

  const handleSave = async () => {
    if (!dmnModeler) return;
    setIsSaveModalVisible(true);
  };

  const confirmSave = async () => {
    if (!dmnModeler) return;
    
    try {
      setSaving(true);
      
      // Obtenir le XML du DMN actuel
      const activeEditor = dmnModeler.getActiveViewer();
      const { xml } = await dmnModeler.saveXML({ format: true });
      setDmnXml(xml);
      
      const dmnData = {
        name: dmnName,
        content: xml
      };
      
      let savedDmn;
      if (dmnId) {
        savedDmn = await dmnService.updateDmn(dmnId, dmnData);
        message.success('DMN mis à jour avec succès');
      } else {
        savedDmn = await dmnService.createDmn(dmnData);
        if (onSave) onSave(savedDmn);
        message.success('DMN créé avec succès');
      }
      
      setIsSaveModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du DMN', error);
      message.error('Impossible de sauvegarder le DMN');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!dmnModeler) return;
    
    try {
      const { xml } = await dmnModeler.saveXML({ format: true });
      
      // Créer un lien de téléchargement et cliquer automatiquement
      const element = document.createElement('a');
      const file = new Blob([xml], { type: 'application/xml' });
      element.href = URL.createObjectURL(file);
      element.download = `${dmnName.replace(/\s+/g, '_')}.dmn`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Erreur lors du téléchargement du DMN', error);
      message.error('Impossible de télécharger le DMN');
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !dmnModeler) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const xmlContent = event.target.result;
      dmnModeler.importXML(xmlContent)
        .then(() => {
          message.success('DMN importé avec succès');
          setDmnXml(xmlContent);
        })
        .catch(err => {
          console.error('Erreur lors de l\'importation du fichier DMN', err);
          message.error('Le fichier n\'est pas un DMN valide');
        });
    };
    reader.readAsText(file);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const name = dmnName || file.name.replace(/\.[^/.]+$/, "");
      const result = await dmnService.uploadDmnFile(file, name);
      message.success('DMN importé et sauvegardé avec succès');
      if (onSave) onSave(result);
    } catch (error) {
      console.error('Erreur lors de l\'importation du fichier DMN', error);
      message.error('Impossible d\'importer le DMN');
    }
  };

  return (
    <div className="dmn-editor-container">
      <div className="dmn-editor-header">
        <Input 
          value={dmnName}
          onChange={e => setDmnName(e.target.value)}
          placeholder="Nom de la table de décision"
          className="dmn-name-input"
        />
        <Space>
          <input
            type="file"
            id="upload-dmn-view"
            style={{ display: 'none' }}
            accept=".dmn,.xml"
            onChange={handleUpload}
          />
          <input
            type="file"
            id="upload-dmn-save"
            style={{ display: 'none' }}
            accept=".dmn,.xml"
            onChange={handleUploadFile}
          />
          <Tooltip title="Importer un DMN (aperçu uniquement)">
            <Button 
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('upload-dmn-view').click()}
            >
              Importer
            </Button>
          </Tooltip>
          <Tooltip title="Importer et sauvegarder un DMN">
            <Button 
              icon={<UploadOutlined />}
              type="primary"
              onClick={() => document.getElementById('upload-dmn-save').click()}
            >
              Importer & Sauvegarder
            </Button>
          </Tooltip>
          <Tooltip title="Télécharger le DMN">
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Télécharger
            </Button>
          </Tooltip>
          <Tooltip title="Sauvegarder le DMN">
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              Sauvegarder
            </Button>
          </Tooltip>
        </Space>
      </div>
      <div className="dmn-editor-content" ref={containerRef}></div>

      <Modal
        title="Sauvegarder la Table de Décision"
        open={isSaveModalVisible}
        onCancel={() => setIsSaveModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsSaveModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={saving}
            onClick={confirmSave}
          >
            Sauvegarder
          </Button>
        ]}
      >
        <p>Nom de la table de décision:</p>
        <Input 
          value={dmnName}
          onChange={e => setDmnName(e.target.value)}
          placeholder="Nom de la table de décision"
        />
      </Modal>
    </div>
  );
};

export default DmnEditor; 