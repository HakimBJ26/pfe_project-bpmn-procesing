import React from 'react';
import { Paper, Box } from '@mui/material';
import AceEditor from 'react-ace';

// Importer les modes et thèmes pour AceEditor
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/ext-language_tools';

export const CodeEditor = ({
  value,
  onChange,
  mode = 'javascript',
  theme = 'tomorrow',
  height = '300px',
  width = '100%',
  readOnly = false,
  showGutter = true,
  fontSize = 14,
  highlightActiveLine = true,
  enableBasicAutocompletion = true,
  enableLiveAutocompletion = true,
  enableSnippets = true,
  showPrintMargin = false
}) => {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ width: '100%', height: height }}>
        <AceEditor
          mode={mode}
          theme={theme}
          name={`editor-${Math.random().toString(36).substring(7)}`}
          value={value}
          onChange={onChange}
          width={width}
          height={height}
          readOnly={readOnly}
          showGutter={showGutter}
          fontSize={fontSize}
          highlightActiveLine={highlightActiveLine}
          enableBasicAutocompletion={enableBasicAutocompletion}
          enableLiveAutocompletion={enableLiveAutocompletion}
          enableSnippets={enableSnippets}
          showPrintMargin={showPrintMargin}
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            useWorker: false,
            tabSize: 2
          }}
        />
      </Box>
    </Paper>
  );
};

export default CodeEditor;
