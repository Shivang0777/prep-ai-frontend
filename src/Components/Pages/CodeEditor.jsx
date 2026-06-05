import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaTerminal, FaListAlt } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import axios from 'axios';

import './CodeEditor.css';
const CodeEditor = () => {
  const { id } = useParams();
  const editorRef = useRef(null);
  const [question, setQuestion] = useState(null);
  
  const [language, setLanguage] = useState("javascript");
  const [userCode, setUserCode] = useState(""); 
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [dataLoading, setDataLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState("testcase"); 
  const [testStatus, setTestStatus] = useState(null);

  const FALLBACK_SNIPPETS = {
    javascript: "function solution(head) {\n  // write code here\n  return head;\n}",
    python: "def solution(head):\n    # pass"
  };
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setDataLoading(true);
        // 🔄 DYNAMIC REPLACEMENT: Hardcoded localhost hatakar `API_URL` bitha diya hai
        const res = await axios.get(`${API_URL}/api/questions/${id}`);
        if (res.data) {
          setQuestion(res.data);
          setUserCode(res.data.snippets?.[language] || FALLBACK_SNIPPETS[language]);
        }
        setDataLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setDataLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  const runCode = async () => {
    if (!question || !question.testCases?.length) return;
    
    setLoading(true);
    setActiveTab("result"); 
    setTestStatus(null);
    setOutput("Executing...");
    if (setLogs) setLogs("");

    const currentCase = question.testCases[0]; 
    let capturedLogs = [];

    try {
      const executionLogic = `
        function ListNode(val, next) {
          this.val = (val===undefined ? 0 : val);
          this.next = (next===undefined ? null : next);
        }

        function toLL(arr) {
          if (!Array.isArray(arr) || arr.length === 0 || Array.isArray(arr[0])) return arr;
          let head = new ListNode(arr[0]);
          let curr = head;
          for (let i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
          }
          return head;
        }

        function toArr(node) {
          if (!node || Array.isArray(node)) return node;
          let res = [], curr = node;
          while(curr) {
            res.push(curr.val !== undefined ? curr.val : curr);
            curr = curr.next;
          }
          return res;
        }

        ${userCode}

        try {
          const inputData = [${currentCase.inputDisplay}]; 
          
          const fn = typeof solution === 'function' ? solution : 
                     typeof twoSum === 'function' ? twoSum :
                     typeof reorderList === 'function' ? reorderList : 
                     typeof reverseList === 'function' ? reverseList : 
                     typeof numIslands === 'function' ? numIslands : null;
          
          if (!fn) throw new Error("Function 'solution' not found!");

          const isLL = ${question.topic === 'Linked List'};
          const finalInputs = inputData.map((val, idx) => (idx === 0 && isLL) ? toLL(val) : val);
          
          const result = fn(...finalInputs);
          
          const finalResult = (result !== null && result !== undefined) ? result : finalInputs[0];
          return JSON.stringify(toArr(finalResult));
        } catch (e) { throw e; }
      `;

      const execute = new Function('console', executionLogic);
      const resultString = execute({ 
        log: (...args) => capturedLogs.push(args.map(String).join(' ')) 
      });

      if (setLogs) setLogs(capturedLogs.join("\n"));
      setOutput(resultString);

      const expectedClean = JSON.stringify(JSON.parse(currentCase.expected));
      setTestStatus(resultString === expectedClean ? "passed" : "failed");

    } catch (error) {
      setOutput("Error: " + error.message);
      setTestStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="loading-core"><h3>BOOTING CORE ENGINE...</h3></div>;
  if (!question) return <div className="error-mission"><h2>404: Mission Not Found</h2><Link to="/dashboard">Return</Link></div>;

  return (
    <div className="editor-container">
      {/* Top Navbar */}
      <div className="editor-header">
        <div className="header-left">
            <Link to="/dashboard/technical?from=editor" className="back-btn"><FaArrowLeft /> Dashboard</Link>
            <h3>{question.id}. {question.title}</h3>
        </div>
        <div className="header-right">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="lang-select">
                <option value="javascript">JavaScript</option>
            </select>
            <button onClick={runCode} disabled={loading} className="run-btn">
                <FaPlay size={10}/> {loading ? "Running..." : "Run"}
            </button>
        </div>
      </div>

      <div className="workspace">
        {/* Left Side: Description */}
        <div className="problem-panel">
            <span className="badge easy">{question.difficulty}</span>
            <h4>Description</h4>
            <p>{question.description}</p>
            <div className="example-box">
               <h5>Example:</h5>
               <pre>{question.example}</pre>
            </div>
        </div>

        {/* Right Side: Editor and Terminal */}
        <div className="code-area-wrapper">
            <div className="code-panel">
                <Editor 
                  height="100%" 
                  theme="vs-dark" 
                  language={language} 
                  value={userCode} 
                  onChange={(v) => setUserCode(v)} 
                  onMount={handleEditorDidMount} 
                  options={{ fontSize: 16, minimap: {enabled: false}, automaticLayout: true }} 
                />
            </div>
            
            <div className="console-panel">
                <div className="console-header">
                    <button onClick={() => setActiveTab("testcase")} className={`tab-btn ${activeTab === 'testcase' ? 'active-tab' : ''}`}><FaListAlt /> Case 1</button>
                    <button onClick={() => setActiveTab("result")} className={`tab-btn ${activeTab === 'result' ? 'active-result' : ''}`}><FaTerminal /> Result</button>
                </div>
                <div className="console-output">
                    {activeTab === "testcase" && (
                        <div>
                            <p className="console-title">Input:</p>
                            <div className="testcase-box">{question.testCases?.[0]?.inputDisplay || "N/A"}</div>
                            <p className="console-title">Expected:</p>
                            <div className="testcase-box">{question.testCases?.[0]?.expected || "N/A"}</div>
                        </div>
                    )}
                    {activeTab === "result" && (
                        <div>
                            {loading ? <span>Executing...</span> : (
                                <>
                                    {logs && <div style={{marginBottom:'10px'}}><p style={{color:'#444', fontSize:'10px', margin:0}}>Logs:</p><pre style={{ color: '#aaa', margin:0 }}>{logs}</pre></div>}
                                    {testStatus === "passed" ? <h3 style={{color:'#2ecc71', margin:0}}>✅ Accepted</h3> : testStatus === "failed" ? <h3 style={{color:'#e74c3c', margin:0}}>❌ Wrong Answer</h3> : <p style={{margin:0}}>Run code to see results</p>}
                                    <div className="output-box">
                                        <p className="console-title">Output:</p>
                                        <code style={{color: testStatus==='passed'?'#2ecc71':'#e74c3c'}}>{output || "null"}</code>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;