import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from '@google/genai';

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    app: {
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'max-width 0.5s ease-in-out',
    },
    appSplitView: {
        maxWidth: '1200px',
    },
    mainContainer: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    chatWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    header: {
        backgroundColor: 'var(--surface-color)',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    headerLogo: {
        width: '28px',
        height: '28px',
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.25em',
        color: '#ffffff',
        fontWeight: 600,
    },
    chatContainer: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px', // Reduced gap for suggestions
    },
    messageContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'flex-start',
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    message: {
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '12px',
        lineHeight: '1.6',
        wordWrap: 'break-word',
    },
    userMessage: {
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        alignSelf: 'flex-end',
        borderBottomRightRadius: '4px',
    },
    modelMessage: {
        backgroundColor: 'var(--message-model-bg)',
        color: 'var(--text-color)',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: '4px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: '#121316',
        gap: '12px',
    },
    inputWrapper: {
        display: 'flex',
        gap: '12px',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: '#25262A',
        color: 'var(--text-color)',
        fontSize: '1em',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        maxHeight: '150px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    inputFocus: {
        borderColor: 'var(--primary-color)',
        boxShadow: `0 0 0 3px rgba(0, 162, 255, 0.2)`,
    },
    button: {
        padding: '12px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 500,
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonHover: {
        backgroundColor: '#008de5',
    },
    buttonDisabled: {
        backgroundColor: '#555',
        cursor: 'not-allowed',
        opacity: 0.6,
    },
    codeBlockContainer: {
        backgroundColor: '#111',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        margin: '12px 0',
    },
    codeBlockHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#25262A',
        borderBottom: '1px solid var(--border-color)',
    },
    codeBlockLang: {
        color: '#aaa',
        fontSize: '0.85em',
        fontWeight: 500,
    },
    pre: {
        padding: '12px',
        margin: 0,
        overflowX: 'auto',
        fontFamily: "'Roboto Mono', monospace",
        fontSize: '0.9em',
        whiteSpace: 'pre-wrap',
    },
    code: {
        fontFamily: "'Roboto Mono', monospace",
    },
    copyButton: {
        padding: '4px 8px',
        backgroundColor: '#333',
        color: '#eee',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8em',
        transition: 'background-color 0.2s ease',
    },
    loader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        gap: '8px',
    },
    dot: {
        width: '8px',
        height: '8px',
        margin: '0 2px',
        backgroundColor: '#888',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'blink 1.4s infinite both',
    },
    dotSmall: {
        width: '6px',
        height: '6px',
    },
    timer: {
        fontSize: '0.9em',
        color: '#aaa',
    },
    heading: {
        fontSize: '1.2em',
        fontWeight: 700,
        marginTop: '16px',
        marginBottom: '8px',
        color: '#fff',
    },
    scriptViewer: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        borderLeft: '1px solid var(--border-color)',
        backgroundColor: '#16171A',
    },
    scriptViewerHeader: {
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
    },
    scriptViewerHeaderActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    scriptViewerTitle: {
        fontSize: '1.1em',
        fontWeight: 600,
        color: '#fff',
        margin: 0,
    },
    scriptViewerCloseBtn: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        fontSize: '1.5em',
        cursor: 'pointer',
        padding: '4px',
        lineHeight: 1,
        transition: 'color 0.2s ease',
    },
    scriptViewerCloseBtnHover: {
        color: '#fff',
    },
    scriptViewerContent: {
        padding: '20px',
        overflowY: 'auto',
        flex: 1,
    },
    scriptViewerDescription: {
        color: 'var(--text-secondary-color)',
        marginBottom: '16px',
        fontStyle: 'italic',
    },
    scriptBlockPreview: {
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#2C2D31',
        marginTop: '12px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    scriptBlockPreviewLoading: {
        animation: 'pulseBorder 1.5s infinite',
    },
    scriptBlockPreviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
    },
    scriptBlockPreviewTitle: {
        margin: 0,
        fontSize: '1.1em',
        fontWeight: 600,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    scriptBlockPreviewDescription: {
        margin: '8px 0 16px',
        color: 'var(--text-secondary-color)',
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8em',
        padding: '4px 8px',
        borderRadius: '12px',
    },
    statusIndicatorLoading: {
        color: '#FFB800',
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
    },
    statusIndicatorComplete: {
        color: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    suggestionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        marginTop: '8px',
        maxWidth: '85%',
    },
    suggestionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        padding: '8px 12px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
    },
    suggestionButtonHover: {
        backgroundColor: 'rgba(0, 162, 255, 0.2)',
        borderColor: 'var(--primary-color)',
    },
    attachmentButton: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#25262A',
        color: '#a0a0a0',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, color 0.2s ease',
    },
    imagePreviewContainer: {
        position: 'relative',
        display: 'inline-block',
        marginLeft: '16px',
        marginBottom: '8px',
    },
    imagePreview: {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        objectFit: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: '#333',
        color: 'white',
        border: '1px solid #555',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '12px',
    },
    continuationContainer: {
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 184, 0, 0.1)',
        border: '1px solid rgba(255, 184, 0, 0.3)',
        marginTop: '8px',
    },
    continuationText: {
        margin: '0 0 12px 0',
        color: '#FFB800',
        fontSize: '0.9em',
    },
    continueButton: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 500,
        transition: 'background-color 0.2s ease',
    },
    connectButton: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: '#25262A',
        color: '#E5E5E5',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 500,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'var(--surface-color)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.5em',
        color: '#fff',
    },
    modalStep: {
        marginBottom: '16px',
    },
    modalStepTitle: {
        fontSize: '1.1em',
        fontWeight: 600,
        color: '#fff',
        marginBottom: '8px',
    },
    modalStepBody: {
        color: 'var(--text-secondary-color)',
        lineHeight: 1.6,
    },
    modalStepBodyStrong: {
        color: 'var(--text-color)',
        fontWeight: 600,
    },
};

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes blink {
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
}
@keyframes pulseBorder {
    0% { border-color: var(--primary-color); box-shadow: 0 0 5px rgba(0, 162, 255, 0.5); }
    50% { border-color: #007acc; box-shadow: 0 0 15px rgba(0, 162, 255, 0.8); }
    100% { border-color: var(--primary-color); box-shadow: 0 0 5px rgba(0, 162, 255, 0.5); }
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
.dot-sm .dot { animation: blink 1.4s infinite both; }
`;
document.head.appendChild(styleSheet);


interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ScriptData {
    title: string;
    description: string;
    code: string;
}

interface AttachedFile {
    data: string; // base64
    mimeType: string;
    preview: string; // object URL
}

const API_KEY = process.env.API_KEY;

const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve({ data: base64Data, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });

// --- ICONS ---
const RobloxLogo = () => ( <svg style={styles.headerLogo} viewBox="0 0 28 28" fill="none" xmlns="http://www.w.org/2000/svg"><path d="M14 2.33331L23.3333 7.58331V17.9166L14 23.0833L4.66667 17.9166V7.58331L14 2.33331Z" stroke="var(--primary-color)" strokeWidth="2" strokeLinejoin="round"/><path d="M14 13.4167L9.33333 10.8333L4.66667 7.58331" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23.3333 7.58331L14 13.4167" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 23.0833V13.4166" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ScriptIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 13H8" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17H8" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 9H8" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const AttachmentIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w.org/2000/svg"><path d="M21.44 11.05L12.35 20.14C11.6235 20.8649 10.6559 21.2941 9.63993 21.3532C8.62396 21.4123 7.61053 21.1001 6.78917 20.4754C5.96781 19.8507 5.39953 18.9603 5.19834 17.9575C5.00216 16.9547 5.18437 15.9238 5.71 15L14.8 5.91C15.1984 5.51161 15.7335 5.29291 16.2891 5.29291C16.8447 5.29291 17.3798 5.51161 17.7782 5.91C18.1766 6.30839 18.3953 6.84351 18.3953 7.4C18.3953 7.95649 18.1766 8.49161 17.7782 8.89L8.69 18C8.3 18.39 7.76 18.61 7.2 18.61C6.64 18.61 6.1 18.39 5.71 18C5.32 17.61 5.1 17.07 5.1 16.51C5.1 15.95 5.32 15.41 5.71 15.02L14.8 5.91" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const CheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const ConnectIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM17 12H7"/><path d="M12 7l-5 5 5 5"/></svg> );


// --- COMPONENTS ---
const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang = "Luau" }) => {
    const [copyText, setCopyText] = useState('Copy');
    
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopyText('Copied!');
        setTimeout(() => setCopyText('Copy'), 2000);
    };

    return ( <div style={styles.codeBlockContainer}><div style={styles.codeBlockHeader}><span style={styles.codeBlockLang}>{lang}</span><button onClick={handleCopy} style={styles.copyButton}>{copyText}</button></div><pre style={styles.pre}><code style={styles.code}>{code}</code></pre></div> );
};

const ProcessedText = ({ text }: { text: string }) => {
    return ( <> {text.split('\n').filter(line => line.trim() !== '').map((line, lineIndex) => { if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) { return <h2 key={lineIndex} style={styles.heading}>{line.substring(2, line.length - 2)}</h2>; } const renderWithUnderlines = (str: string) => { return str.split(/(__.+?__)/g).map((part, partIndex) => { if (part.startsWith('__') && part.endsWith('__')) { return <u key={partIndex}>{part.substring(2, part.length - 2)}</u>; } return part; }); }; const bulletMatch = line.match(/^\d+\.\s\*\*([^:]+):\*\*\s?(.*)|^\s*🔍\s\*\*([^:]+):\*\*\s?(.*)|^\s*🛠️\s\*\*([^:]+):\*\*\s?(.*)|^\s*💡\s\*\*([^:]+):\*\*\s?(.*)|^\s*🧩\s\*\*([^:]+):\*\*\s?(.*)|^\s*✅\s\*\*([^:]+):\*\*\s?(.*)|^\s*🧠\s\*\*([^:]+):\*\*\s?(.*)/); if (bulletMatch) { const [, ...groups] = bulletMatch; let boldPart = ''; let restPart = ''; for (let i = 0; i < groups.length; i += 2) { if (groups[i] !== undefined) { boldPart = groups[i]; restPart = groups[i + 1] || ''; break; } } return ( <p key={lineIndex} style={{ margin: '4px 0', paddingLeft: '8px' }}><strong style={{ color: '#fff' }}>{boldPart}:</strong><span> {renderWithUnderlines(restPart)}</span></p> ); } return <p key={lineIndex} style={{ margin: '4px 0' }}>{renderWithUnderlines(line)}</p>; })} </> );
};

const ScriptBlockPreview: React.FC<{ script: ScriptData; onSelect: (script: ScriptData) => void; isComplete: boolean; }> = ({ script, onSelect, isComplete }) => {
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    return ( <div style={{...styles.scriptBlockPreview, ...(!isComplete ? styles.scriptBlockPreviewLoading : {})}}><header style={styles.scriptBlockPreviewHeader}><div style={styles.scriptBlockPreviewTitle}><ScriptIcon /><h3 style={{margin: 0, fontSize: '1em', fontWeight: 600}}>{script.title}</h3></div><div style={{...styles.statusIndicator, ...(isComplete ? styles.statusIndicatorComplete : styles.statusIndicatorLoading)}}>{isComplete ? <CheckIcon/> : <div className="dot-sm"><div style={{...styles.dot, ...styles.dotSmall}}></div></div>}<span>{isComplete ? 'Complete' : 'Generating...'}</span></div></header><p style={styles.scriptBlockPreviewDescription}>{script.description}</p><button onClick={() => onSelect(script)} disabled={!isComplete} style={{...styles.button, width: '100%', ...(!isComplete ? styles.buttonDisabled : {}), ...(isButtonHovered && isComplete ? styles.buttonHover : {})}} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)}>View Script</button></div> );
}

const FormattedMessage: React.FC<{ text: string, onSelectScript: (script: ScriptData) => void, onSuggestionsParse: (suggestions: string[]) => void }> = ({ text, onSelectScript, onSuggestionsParse }) => {
    useEffect(() => {
        const suggestionsMatch = text.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
        if (suggestionsMatch && suggestionsMatch[1]) {
            const suggestionList = suggestionsMatch[1].split('|').filter(s => s.trim() !== '');
            onSuggestionsParse(suggestionList);
        }
    }, [text, onSuggestionsParse]);

    const cleanText = text.replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/g, '').trim();
    const parts = cleanText.split(/(\[SCRIPT_BLOCK:[\s\S]*?\[\/SCRIPT_BLOCK\]|\[SCRIPT_BLOCK:[\s\S]*)/g);
    
    return ( <div> {parts.map((part, index) => { if (part.startsWith('[SCRIPT_BLOCK:')) { const isComplete = part.includes('[/SCRIPT_BLOCK]'); const titleMatch = part.match(/title="([^"]*)"/); const descriptionMatch = part.match(/description="([^"]*)"/); const contentMatch = part.match(/\]([\s\S]*?)(\[\/SCRIPT_BLOCK\]|$)/); if (titleMatch && descriptionMatch && contentMatch) { let code = contentMatch[1].trim(); const luaBlockMatch = code.match(/```lua\n([\s\S]*?)```/); if (luaBlockMatch) { code = luaBlockMatch[1]; } else { code = code.replace(/^```\n?/, '').replace(/\n?```$/, '').trim(); } const script: ScriptData = { title: titleMatch[1], description: descriptionMatch[1], code: code, }; return <ScriptBlockPreview key={index} script={script} onSelect={onSelectScript} isComplete={isComplete} />; } } if (part.trim() === '') return null; return <ProcessedText key={index} text={part} />; })} </div> );
};

const ScriptViewer: React.FC<{ script: ScriptData; onClose: () => void; userId: string | null; }> = ({ script, onClose, userId }) => {
    const [isCloseHovered, setIsCloseHovered] = useState(false);
    const [isSendHovered, setIsSendHovered] = useState(false);
    const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleSendToStudio = async () => {
        if (!userId) {
            alert("Cannot send to Studio. User ID is missing. Please connect to studio from the main page and try again.");
            return;
        }
        setSendState('sending');
        try {
            const topic = `roblox-ai-coder-${userId}`;
            const response = await fetch(`https://ntfy.sh/${topic}`, {
                method: 'POST',
                body: JSON.stringify({
                    title: script.title,
                    description: script.description,
                    code: script.code
                }),
                headers: { 'Title': `New Script: ${script.title}`, 'Tags': 'robot,computer' }
            });

            if (response.ok) {
                setSendState('sent');
            } else {
                setSendState('error');
            }
        } catch (e) {
            console.error("Failed to send script:", e);
            setSendState('error');
        } finally {
            setTimeout(() => setSendState('idle'), 3000);
        }
    };

    const getSendButtonText = () => {
        switch (sendState) {
            case 'sending': return 'Sending...';
            case 'sent': return 'Sent!';
            case 'error': return 'Error';
            default: return 'Send to Studio';
        }
    };

    return (
        <aside style={styles.scriptViewer} aria-label="Script Viewer">
            <header style={styles.scriptViewerHeader}>
                <h2 style={styles.scriptViewerTitle}>{script.title}</h2>
                <div style={styles.scriptViewerHeaderActions}>
                    <button 
                        onClick={handleSendToStudio} 
                        style={{...styles.button, padding: '8px 16px', fontSize: '0.9em', ...(isSendHovered && sendState === 'idle' ? styles.buttonHover: {}), ...(sendState !== 'idle' ? styles.buttonDisabled : {})}} 
                        disabled={sendState !== 'idle'}
                        onMouseEnter={() => setIsSendHovered(true)} 
                        onMouseLeave={() => setIsSendHovered(false)}
                    >
                        {getSendButtonText()}
                    </button>
                    <button onClick={onClose} style={{...styles.scriptViewerCloseBtn, ...(isCloseHovered ? styles.scriptViewerCloseBtnHover : {})}} onMouseEnter={() => setIsCloseHovered(true)} onMouseLeave={() => setIsCloseHovered(false)} aria-label="Close script viewer">&times;</button>
                </div>
            </header>
            <div style={styles.scriptViewerContent}>
                <p style={styles.scriptViewerDescription}>{script.description}</p>
                <CodeBlock code={script.code} />
            </div>
        </aside>
    );
};

const ConnectionModal: React.FC<{ userId: string; onClose: () => void; }> = ({ userId, onClose }) => {
    const [isCloseHovered, setIsCloseHovered] = useState(false);
    const pluginCode = `-- Roblox AI Coder Connector Plugin
--
-- INSTRUCTIONS:
-- 1. In Roblox Studio, go to Game Settings > Security.
-- 2. Enable the "Allow HTTP Requests" option.
-- 3. Create a new Script in ServerScriptService.
-- 4. Paste this entire code into the new script.
-- 5. That's it! Scripts you "Send to Studio" will now appear in ServerScriptService.

local HttpService = game:GetService("HttpService")
local ServerScriptService = game:GetService("ServerScriptService")

-- Your unique and private User ID for receiving scripts.
local USER_ID = "roblox-ai-coder-${userId}"
local NTFY_TOPIC_URL = "https://ntfy.sh/" .. USER_ID .. "/json"

local function createOrUpdateScript(data)
    local scriptName = data.title or "NewAIScript"
    local scriptCode = data.code or "-- No code received"
    
    -- Sanitize the name to be a valid instance name
    local safeName = scriptName:gsub("[^%w_ %-]", "")
    if safeName:len() == 0 then safeName = "AIScript" end

    local existingScript = ServerScriptService:FindFirstChild(safeName)
    if existingScript and existingScript:IsA("Script") then
        print("Roblox AI Coder: Updating script '" .. safeName .. "'")
        existingScript.Source = scriptCode
    else
        print("Roblox AI Coder: Creating new script '" .. safeName .. "'")
        local newScript = Instance.new("Script")
        newScript.Name = safeName
        newScript.Source = scriptCode
        newScript.Parent = ServerScriptService
    end
    
    print("Roblox AI Coder: Successfully synced script: " .. safeName)
end

local function listenForScripts()
    print("Roblox AI Coder: Connecting to sync service...")
    while task.wait(1) do
        local success, response = pcall(function()
            -- Use long-polling to wait for new messages
            return HttpService:GetAsync(NTFY_TOPIC_URL)
        end)

        if success and response then
            local lines = response:split("\\n")
            for _, line in ipairs(lines) do
                if line:len() > 0 then
                    local decodedSuccess, data = pcall(function()
                        return HttpService:JSONDecode(line)
                    end)

                    if decodedSuccess and data.event == "message" then
                        local messageData = HttpService:JSONDecode(data.message)
                        -- Run in a separate thread to not block the listener
                        task.spawn(createOrUpdateScript, messageData)
                    end
                end
            end
        else
            warn("Roblox AI Coder: Connection failed. Retrying in 10s. Error: " .. tostring(response))
            task.wait(10)
        end
    end
end

-- Start the listener in a new thread
task.spawn(listenForScripts)
`;

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <header style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Connect to Roblox Studio</h2>
                    <button onClick={onClose} style={{...styles.scriptViewerCloseBtn, ...(isCloseHovered ? styles.scriptViewerCloseBtnHover : {})}} onMouseEnter={() => setIsCloseHovered(true)} onMouseLeave={() => setIsCloseHovered(false)} aria-label="Close modal">&times;</button>
                </header>
                <div style={styles.modalBody}>
                    <div style={styles.modalStep}>
                        <h3 style={styles.modalStepTitle}>Step 1: Enable HTTP Requests</h3>
                        <p style={styles.modalStepBody}>In Roblox Studio, go to <span style={styles.modalStepBodyStrong}>Home &gt; Game Settings &gt; Security</span> and turn on the <span style={styles.modalStepBodyStrong}>Allow HTTP Requests</span> toggle.</p>
                    </div>
                    <div style={styles.modalStep}>
                        <h3 style={styles.modalStepTitle}>Step 2: Create Connector Script</h3>
                        <p style={styles.modalStepBody}>In the Explorer window, hover over <span style={styles.modalStepBodyStrong}>ServerScriptService</span>, click the '+' icon, and add a new <span style={styles.modalStepBodyStrong}>Script</span>.</p>
                    </div>
                     <div style={styles.modalStep}>
                        <h3 style={styles.modalStepTitle}>Step 3: Paste the Code</h3>
                        <p style={styles.modalStepBody}>Copy the code below and paste it into your new script. This code will listen for scripts you send from this web page.</p>
                    </div>
                    <CodeBlock code={pluginCode} />
                </div>
            </div>
        </div>
    );
};


const Suggestion: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return ( <button onClick={onClick} style={{...styles.suggestionButton, ...(isHovered ? styles.suggestionButtonHover : {})}} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}> {text} </button> );
}

const Suggestions: React.FC<{ suggestions: string[], onSelect: (suggestion: string) => void }> = ({ suggestions, onSelect }) => {
    return ( <div style={styles.suggestionsContainer} aria-label="Suggestions"> {suggestions.map((s, i) => <Suggestion key={i} text={s} onClick={() => onSelect(s)} />)} </div> );
}

const Continuation: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div style={styles.continuationContainer}>
            <p style={styles.continuationText}>The response may have been interrupted. Click to continue generating.</p>
            <button
                onClick={onContinue}
                style={{ ...styles.continueButton, ...(isHovered ? styles.buttonHover : {}) }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                Continue
            </button>
        </div>
    );
};


const App = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([ { role: 'model', text: "Hello! I'm your advanced Roblox scripting partner. I write, verify, and version-control Luau scripts to ensure they're bug-free and efficient. How can I help you today? 🚀" } ]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
    const [loading, setLoading] = useState(false);
    const [isContinuable, setIsContinuable] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isConnectHovered, setIsConnectHovered] = useState(false);
    const [activeScript, setActiveScript] = useState<ScriptData | null>(null);
    const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!API_KEY) return;
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: `🧩 You are an advanced Roblox scripting AI assistant. You are trained to write, review, and improve Luau code for any Roblox system. Your mission is to produce logical, efficient, bug-free, and human-readable code. You must meticulously reason about your scripts before outputting them.

🎯 **Core Directives:**
1.  **Think Like a Senior Developer:** Prioritize best practices, security, and performance.
2.  **Self-Correction:** Before responding, triple-check your code for syntax errors. Be diligent.
3.  **Predict & Prevent Bugs:** Anticipate edge cases and potential runtime errors.
4.  **No Hallucinations:** Never invent nonexistent Roblox APIs or incorrect Luau features.
5.  **Context is Key:** ALWAYS consider the entire conversation history to ensure new scripts integrate perfectly with previous ones.
6.  **Handle Images:** If the user provides an image, use it as visual context for their request (e.g., error screenshots, UI mockups).

- **Script Versioning:**
- Every script must have a version number (e.g., v1.0). Increment it upon changes.
- Include the version in the script title, like: \`**💥 Kill Brick Script (v1.0)**\` or \`[SCRIPT_BLOCK: title="DataStore Manager (v1.0)", ...]\`.

**Formatting Rules (Strictly Follow):**
- For **any and all Luau scripts**, you MUST wrap each in a special block: \`[SCRIPT_BLOCK: title="Your Script Title (vX.X)", description="A brief one-sentence description."]\` ... \`[/SCRIPT_BLOCK]\`.
- Inside the block, use a standard \`\`\`lua code block.
- For other responses, use this friendly format: 🧩 **Bold titles**, ✅ Step-by-step lists, 🧠 Explanations, ✨ Emojis.

**Suggestion Generation (Mandatory):**
- After providing a script and explanation, you MUST provide 3-4 actionable suggestions for improvement or new features.
- Format them strictly as follows, on a new line after all other content:
[SUGGESTIONS]Make the brick disappear for 5 seconds after a kill|Add a particle effect on kill|Add a leaderboard to track kills[/SUGGESTIONS]
- Each suggestion must be separated by a pipe character (|).`},
        });
        setChat(newChat);

        let storedUserId = localStorage.getItem('roblox-ai-coder-userId');
        if (!storedUserId) {
            storedUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('roblox-ai-coder-userId', storedUserId);
        }
        setUserId(storedUserId);
    }, []);

    useEffect(() => { chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, activeScript, suggestions, isContinuable]);

    useEffect(() => {
        if (loading) {
            const startTime = Date.now();
            timerRef.current = window.setInterval(() => { setElapsedTime((Date.now() - startTime) / 1000); }, 100);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [loading]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const { data, mimeType } = await fileToBase64(file);
            setAttachedFile({ data, mimeType, preview: URL.createObjectURL(file) });
        }
    };

    const sendPrompt = async (prompt: string, file?: AttachedFile | null) => {
        if (!chat) return;
        setLoading(true);
        setSuggestions([]);
        setIsContinuable(false);
        
        let lastFinishReason: string | undefined = undefined;

        try {
            const contentParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: prompt }];
            if (file) {
                contentParts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });
            }

            const responseStream = await chat.sendMessageStream({ message: contentParts });
            let modelResponse = '';
            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                lastFinishReason = chunk.candidates?.[0]?.finishReason;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = 'Sorry, something went wrong. Please try again.';
                return newMessages;
            });
        } finally {
            setLoading(false);
            if (lastFinishReason && lastFinishReason !== 'STOP') {
                setIsContinuable(true);
            }
        }
    };
    
    const continueGeneration = async () => {
        if (!chat || loading) return;
        
        setIsContinuable(false);
        setLoading(true);

        let lastFinishReason: string | undefined = undefined;

        try {
            const continuePrompt = "Please continue generating the previous response from exactly where you left off. Do not repeat any part of the previous message or add any introductory phrases. Just provide the rest of the text.";
            const responseStream = await chat.sendMessageStream({ message: continuePrompt });

            for await (const chunk of responseStream) {
                lastFinishReason = chunk.candidates?.[0]?.finishReason;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text += chunk.text;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text += '\n\n---\n*An error occurred while trying to continue.*';
                return newMessages;
            });
        } finally {
            setLoading(false);
            if (lastFinishReason && lastFinishReason !== 'STOP') {
                setIsContinuable(true);
            }
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        const userMessage: Message = { role: 'user', text: suggestion };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        sendPrompt(`Amazing, let's do this: "${suggestion}". Remember the code we've discussed so far and integrate this new feature.`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !chat) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        const currentInput = input;
        const currentFile = attachedFile;
        setInput('');
        setAttachedFile(null);
        const textarea = (e.currentTarget as HTMLFormElement).querySelector('textarea');
        if (textarea) textarea.style.height = 'auto';
        
        sendPrompt(currentInput, currentFile);
    };
    
    if (!API_KEY) {
        return ( <div style={{ ...styles.app, alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}><h1 style={styles.headerTitle}>API Key Not Found</h1><p>Please make sure your Gemini API key is configured as an environment variable.</p></div> );
    }

    return (
        <div style={{ ...styles.app, ...(activeScript ? styles.appSplitView : {}) }}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <RobloxLogo />
                    <h1 style={styles.headerTitle}>Roblox AI Coder</h1>
                </div>
                <button 
                    onClick={() => setIsConnectionModalOpen(true)}
                    style={{...styles.connectButton, ...(isConnectHovered ? { borderColor: 'var(--primary-color)' } : {})}}
                    onMouseEnter={() => setIsConnectHovered(true)} 
                    onMouseLeave={() => setIsConnectHovered(false)}
                >
                    <ConnectIcon />
                    Connect to Studio
                </button>
            </header>
            <div style={styles.mainContainer}>
                <div style={styles.chatWrapper}>
                    <main ref={chatContainerRef} style={styles.chatContainer}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{...styles.messageContainer, ...(msg.role === 'user' ? styles.userMessageContainer : {})}}>
                                <div style={{ ...styles.message, ...(msg.role === 'user' ? styles.userMessage : styles.modelMessage) }} aria-live={msg.role === 'model' && index === messages.length - 1 ? 'polite' : 'off'}>
                                    {msg.role === 'model' && msg.text === '' && loading ? (
                                        <div style={styles.loader}><div><div className="dot" style={styles.dot}></div><div className="dot" style={styles.dot}></div><div className="dot" style={styles.dot}></div></div><span style={styles.timer}>({elapsedTime.toFixed(1)}s)</span></div>
                                    ) : ( msg.role === 'model' ? <FormattedMessage text={msg.text} onSelectScript={setActiveScript} onSuggestionsParse={setSuggestions} /> : msg.text )}
                                </div>
                                { msg.role === 'model' && index === messages.length - 1 && suggestions.length > 0 && !loading && ( <Suggestions suggestions={suggestions} onSelect={handleSuggestionClick} /> )}
                                { msg.role === 'model' && index === messages.length - 1 && isContinuable && !loading && ( <Continuation onContinue={continueGeneration} /> )}
                           </div>
                        ))}
                    </main>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {attachedFile && (
                            <div style={styles.imagePreviewContainer}>
                                <img src={attachedFile.preview} alt="File preview" style={styles.imagePreview} />
                                <button onClick={() => setAttachedFile(null)} style={styles.removeImageButton} aria-label="Remove image">&times;</button>
                            </div>
                        )}
                        <div style={styles.inputWrapper}>
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                           <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.attachmentButton} aria-label="Attach file" disabled={loading}><AttachmentIcon /></button>
                            <textarea
                                value={input}
                                onChange={handleTextareaChange}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement)?.requestSubmit(); } }}
                                style={{ ...styles.input, ...(isInputFocused ? styles.inputFocus : {}) }}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                placeholder="Ask about Roblox scripting..."
                                disabled={loading}
                                rows={1}
                                aria-label="Chat input"
                            />
                            <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}), ...(isButtonHovered && !loading ? styles.buttonHover : {}) }} disabled={loading || !input.trim()} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} aria-label="Send message">Send</button>
                        </div>
                    </form>
                </div>
                {activeScript && <ScriptViewer script={activeScript} onClose={() => setActiveScript(null)} userId={userId} />}
            </div>
            {isConnectionModalOpen && userId && <ConnectionModal userId={userId} onClose={() => setIsConnectionModalOpen(false)} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);