const React = require('react');
const ReactDOM = require('react-dom/client');

const { useState, useEffect, useRef, useCallback } = React;

function getInitialView() {
    try {
        return localStorage.getItem('onboardingCompleted') ? 'main' : 'main';
    } catch (e) {
        return 'main';
    }
}

function getInitialProfile() {
    try {
        return localStorage.getItem('selectedProfile') || 'interview';
    } catch (e) {
        return 'interview';
    }
}

function getInitialLanguage() {
    try {
        return localStorage.getItem('selectedLanguage') || 'en-US';
    } catch (e) {
        return 'en-US';
    }
}

function getInitialInterval() {
    try {
        return localStorage.getItem('selectedScreenshotInterval') || '5';
    } catch (e) {
        return '5';
    }
}

function getInitialImageQuality() {
    try {
        return localStorage.getItem('selectedImageQuality') || 'medium';
    } catch (e) {
        return 'medium';
    }
}

function getInitialLayoutMode() {
    try {
        return localStorage.getItem('layoutMode') || 'normal';
    } catch (e) {
        return 'normal';
    }
}

function getInitialAdvancedMode() {
    try {
        return localStorage.getItem('advancedMode') === 'true';
    } catch (e) {
        return false;
    }
}

function readApiKey() {
    try {
        return localStorage.getItem('apiKey') || '';
    } catch (e) {
        return '';
    }
}

function saveLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {}
}

function requestResize() {
    try {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('update-sizes').catch(() => {});
        }
    } catch (e) {}
}

function Header(props) {
    const {
        currentView,
        statusText,
        startTime,
        advancedMode,
        isClickThrough,
        onSettings,
        onClose,
        onBack,
        onHide,
    } = props;

    const containerStyle = {
        WebkitAppRegion: 'drag',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        border: '1px solid var(--border-color)',
        background: 'var(--header-background)',
        borderRadius: '8px',
    };

    const titleStyle = {
        flex: 1,
        fontSize: '14px',
        fontWeight: 600,
    };

    const actionsStyle = {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        WebkitAppRegion: 'no-drag',
    };

    const smallTextStyle = {
        fontSize: '12px',
        color: 'var(--header-actions-color)',
    };

    const buttonStyle = {
        background: 'var(--button-background)',
        color: 'var(--text-color)',
        border: '1px solid var(--button-border)',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        WebkitAppRegion: 'no-drag',
    };

    const iconButtonStyle = {
        ...buttonStyle,
        background: 'transparent',
        border: 'none',
    };

    const titles = {
        main: 'Cheating Daddy',
        assistant: 'Cheating Daddy',
        settings: 'Settings',
    };

    const title = titles[currentView] || 'Cheating Daddy';

    let elapsed = '';
    if (currentView === 'assistant' && startTime) {
        const secs = Math.floor((Date.now() - startTime) / 1000);
        elapsed = `${secs}s`;
    }

    const isMac = window.cheddar ? window.cheddar.isMacOS : false;
    const modifier = isMac ? 'Cmd' : 'Ctrl';

    return React.createElement(
        'div',
        { style: containerStyle },
        React.createElement('div', { style: titleStyle }, title),
        React.createElement(
            'div',
            { style: actionsStyle },
            currentView === 'assistant'
                ? React.createElement(
                      React.Fragment,
                      null,
                      React.createElement('span', { style: smallTextStyle }, elapsed),
                      React.createElement(
                          'span',
                          { style: { ...smallTextStyle, marginLeft: 8 } },
                          statusText || '',
                      ),
                      React.createElement(
                          'button',
                          {
                              style: buttonStyle,
                              onClick: onHide,
                              disabled: !!isClickThrough,
                              title: 'Hide window without stopping session',
                          },
                          `Hide ${modifier} \\`,
                      ),
                  )
                : null,
            currentView === 'main'
                ? React.createElement(
                      'button',
                      { style: buttonStyle, onClick: onSettings },
                      advancedMode ? 'Settings' : 'Settings',
                  )
                : null,
            currentView === 'assistant'
                ? React.createElement(
                      'button',
                      { style: iconButtonStyle, onClick: onClose },
                      '✕',
                  )
                : React.createElement(
                      'button',
                      { style: iconButtonStyle, onClick: currentView === 'main' ? onClose : onBack },
                      currentView === 'main' ? '✕' : '← Back',
                  ),
        ),
    );
}

function MainView(props) {
    const { onStart, onAPIKeyHelp, isInitializing, showApiKeyError } = props;
    const [apiKey, setApiKey] = useState(readApiKey());

    useEffect(() => {
        function handleKeydown(e) {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';
            if (isStartShortcut) {
                e.preventDefault();
                onStart();
            }
        }
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [onStart]);

    function handleInput(e) {
        const value = e.target.value;
        setApiKey(value);
        saveLocalStorage('apiKey', value);
    }

    const containerStyle = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 500,
    };

    const welcomeStyle = {
        fontSize: 24,
        marginBottom: 8,
        fontWeight: 600,
        marginTop: 'auto',
    };

    const inputRowStyle = {
        display: 'flex',
        gap: 12,
        marginBottom: 20,
    };

    const inputStyle = {
        flex: 1,
        background: 'var(--input-background)',
        color: 'var(--text-color)',
        border: '1px solid var(--button-border)',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 14,
        outline: 'none',
        boxShadow: showApiKeyError ? '0 0 0 3px rgba(255, 68, 68, 0.4)' : 'none',
        borderColor: showApiKeyError ? '#ff4444' : 'var(--button-border)',
    };

    const buttonStyle = {
        background: 'var(--start-button-background)',
        color: 'var(--start-button-color)',
        border: '1px solid var(--start-button-border)',
        padding: '8px 16px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        cursor: isInitializing ? 'default' : 'pointer',
        opacity: isInitializing ? 0.6 : 1,
    };

    const descriptionStyle = {
        color: 'var(--description-color)',
        fontSize: 14,
        marginBottom: 24,
    };

    const linkStyle = {
        color: 'var(--link-color)',
        textDecoration: 'underline',
        cursor: 'pointer',
    };

    return React.createElement(
        'div',
        { style: containerStyle },
        React.createElement('div', { style: welcomeStyle }, 'Welcome'),
        React.createElement(
            'div',
            { style: inputRowStyle },
            React.createElement('input', {
                type: 'password',
                placeholder: 'Enter your Gemini API Key',
                value: apiKey,
                onChange: handleInput,
                style: inputStyle,
            }),
            React.createElement(
                'button',
                { style: buttonStyle, onClick: onStart },
                'Start Session (Ctrl/Cmd + Enter)',
            ),
        ),
        React.createElement(
            'p',
            { style: descriptionStyle },
            "Don't have an API key? ",
            React.createElement(
                'span',
                { style: linkStyle, onClick: onAPIKeyHelp },
                'Get one here',
            ),
        ),
    );
}

function SettingsView(props) {
    const {
        selectedProfile,
        setSelectedProfile,
        selectedLanguage,
        setSelectedLanguage,
        selectedScreenshotInterval,
        setSelectedScreenshotInterval,
        selectedImageQuality,
        setSelectedImageQuality,
        layoutMode,
        setLayoutMode,
        advancedMode,
        setAdvancedMode,
    } = props;

    const containerStyle = {
        padding: 12,
        maxWidth: 700,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        padding: 16,
    };

    const labelStyle = {
        fontSize: 12,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
        display: 'block',
    };

    const selectStyle = {
        background: 'var(--input-background)',
        color: 'var(--text-color)',
        border: '1px solid var(--input-border)',
        padding: '8px 10px',
        borderRadius: 4,
        fontSize: 12,
        width: '100%',
    };

    const checkboxRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    };

    const profiles = [
        { value: 'interview', label: 'Job Interview' },
        { value: 'sales', label: 'Sales Call' },
        { value: 'meeting', label: 'Business Meeting' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'exam', label: 'Exam Assistant' },
    ];

    const languages = [
        { value: 'en-US', label: 'English (US)' },
        { value: 'en-GB', label: 'English (UK)' },
        { value: 'en-IN', label: 'English (India)' },
        { value: 'de-DE', label: 'German' },
        { value: 'es-ES', label: 'Spanish' },
        { value: 'fr-FR', label: 'French' },
        { value: 'hi-IN', label: 'Hindi' },
    ];

    const intervals = [
        { value: 'manual', label: 'Manual only' },
        { value: '5', label: 'Every 5s' },
        { value: '10', label: 'Every 10s' },
        { value: '20', label: 'Every 20s' },
    ];

    const qualities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    function handleProfileChange(e) {
        const value = e.target.value;
        setSelectedProfile(value);
        saveLocalStorage('selectedProfile', value);
    }

    function handleLanguageChange(e) {
        const value = e.target.value;
        setSelectedLanguage(value);
        saveLocalStorage('selectedLanguage', value);
    }

    function handleIntervalChange(e) {
        const value = e.target.value;
        setSelectedScreenshotInterval(value);
        saveLocalStorage('selectedScreenshotInterval', value);
    }

    function handleQualityChange(e) {
        const value = e.target.value;
        setSelectedImageQuality(value);
        saveLocalStorage('selectedImageQuality', value);
    }

    function handleLayoutChange(e) {
        const value = e.target.value;
        setLayoutMode(value);
        saveLocalStorage('layoutMode', value);
    }

    function handleAdvancedChange(e) {
        const value = e.target.checked;
        setAdvancedMode(value);
        saveLocalStorage('advancedMode', value.toString());
    }

    return React.createElement(
        'div',
        { style: containerStyle },
        React.createElement(
            'div',
            { style: cardStyle },
            React.createElement('div', { style: { ...labelStyle, textTransform: 'uppercase', marginBottom: 12 } }, 'AI Profile'),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Profile type'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: selectedProfile, onChange: handleProfileChange },
                    profiles.map(p =>
                        React.createElement('option', { key: p.value, value: p.value }, p.label),
                    ),
                ),
            ),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Language'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: selectedLanguage, onChange: handleLanguageChange },
                    languages.map(l =>
                        React.createElement('option', { key: l.value, value: l.value }, l.label),
                    ),
                ),
            ),
        ),
        React.createElement(
            'div',
            { style: cardStyle },
            React.createElement('div', { style: { ...labelStyle, textTransform: 'uppercase', marginBottom: 12 } }, 'Capture'),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Screenshot interval'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: selectedScreenshotInterval, onChange: handleIntervalChange },
                    intervals.map(i =>
                        React.createElement('option', { key: i.value, value: i.value }, i.label),
                    ),
                ),
            ),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Image quality'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: selectedImageQuality, onChange: handleQualityChange },
                    qualities.map(q =>
                        React.createElement('option', { key: q.value, value: q.value }, q.label),
                    ),
                ),
            ),
        ),
        React.createElement(
            'div',
            { style: cardStyle },
            React.createElement('div', { style: { ...labelStyle, textTransform: 'uppercase', marginBottom: 12 } }, 'Layout & Mode'),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Layout mode'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: layoutMode, onChange: handleLayoutChange },
                    React.createElement('option', { value: 'normal' }, 'Normal'),
                    React.createElement('option', { value: 'compact' }, 'Compact'),
                ),
            ),
            React.createElement(
                'div',
                { style: checkboxRowStyle },
                React.createElement('input', {
                    type: 'checkbox',
                    checked: advancedMode,
                    onChange: handleAdvancedChange,
                }),
                React.createElement('span', { style: { fontSize: 12 } }, 'Enable advanced tools'),
            ),
        ),
    );
}

function AssistantView(props) {
    const { responses, onSendText } = props;
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef(null);

    const latestResponse = responses.length > 0 ? responses[responses.length - 1] : '';

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [latestResponse]);

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim()) {
                onSendText(inputValue.trim());
                setInputValue('');
            }
        }
    }

    const containerStyle = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    };

    const responseStyle = {
        flex: 1,
        overflowY: 'auto',
        borderRadius: 10,
        fontSize: 'var(--response-font-size, 18px)',
        lineHeight: 1.6,
        background: 'var(--main-content-background)',
        padding: 16,
        userSelect: 'text',
    };

    const inputRowStyle = {
        display: 'flex',
        gap: 10,
        marginTop: 10,
        alignItems: 'center',
    };

    const inputStyle = {
        flex: 1,
        background: 'var(--input-background)',
        color: 'var(--text-color)',
        border: '1px solid var(--button-border)',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 14,
        outline: 'none',
    };

    const buttonStyle = {
        background: 'transparent',
        color: 'var(--start-button-background)',
        border: 'none',
        padding: 0,
        borderRadius: 100,
        cursor: 'pointer',
        fontSize: 18,
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    let renderedHtml = latestResponse || '';
    if (typeof window !== 'undefined' && window.marked && latestResponse) {
        try {
            window.marked.setOptions({ breaks: true, gfm: true, sanitize: false });
            renderedHtml = window.marked.parse(latestResponse);
        } catch (e) {
            renderedHtml = latestResponse;
        }
    }

    return React.createElement(
        'div',
        { style: containerStyle },
        React.createElement('div', {
            style: responseStyle,
            ref: containerRef,
            dangerouslySetInnerHTML: { __html: renderedHtml },
        }),
        React.createElement(
            'div',
            { style: inputRowStyle },
            React.createElement('input', {
                type: 'text',
                placeholder: 'Type a message to the AI...',
                value: inputValue,
                onChange: e => setInputValue(e.target.value),
                onKeyDown: handleKeyDown,
                style: inputStyle,
            }),
            React.createElement(
                'button',
                {
                    style: buttonStyle,
                    onClick: () => {
                        if (inputValue.trim()) {
                            onSendText(inputValue.trim());
                            setInputValue('');
                        }
                    },
                },
                '➤',
            ),
        ),
    );
}

function App() {
    const [currentView, setCurrentView] = useState(getInitialView);
    const [statusText, setStatusText] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(getInitialProfile);
    const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);
    const [selectedScreenshotInterval, setSelectedScreenshotInterval] = useState(getInitialInterval);
    const [selectedImageQuality, setSelectedImageQuality] = useState(getInitialImageQuality);
    const [layoutMode, setLayoutMode] = useState(getInitialLayoutMode);
    const [advancedMode, setAdvancedMode] = useState(getInitialAdvancedMode);
    const [isClickThrough, setIsClickThrough] = useState(false);
    const [responses, setResponses] = useState([]);
    const [isInitializing, setIsInitializing] = useState(false);
    const [showApiKeyError, setShowApiKeyError] = useState(false);

    const viewRef = useRef(currentView);
    const layoutRef = useRef(layoutMode);

    useEffect(() => {
        viewRef.current = currentView;
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('view-changed', currentView);
            } catch (e) {}
        }
        requestResize();
    }, [currentView]);

    useEffect(() => {
        layoutRef.current = layoutMode;
        if (layoutMode === 'compact') {
            document.documentElement.classList.add('compact-layout');
        } else {
            document.documentElement.classList.remove('compact-layout');
        }
        requestResize();
    }, [layoutMode]);

    useEffect(() => {
        if (!window.cheddar || typeof window.cheddar.attachUI !== 'function') return;
        function setResponseFromCheddar(response) {
            setResponses(prev => {
                if (prev.length === 0) {
                    return [response];
                }
                const copy = prev.slice();
                copy[copy.length - 1] = response;
                return copy;
            });
        }
        function setStatusFromCheddar(text) {
            setStatusText(text);
        }
        const ui = {
            getCurrentView: () => viewRef.current,
            getLayoutMode: () => layoutRef.current,
            setStatus: setStatusFromCheddar,
            setResponse: setResponseFromCheddar,
            handleStart: () => handleStart(),
        };
        window.cheddar.attachUI(ui);
    });

    useEffect(() => {
        if (!window.require) return;
        try {
            const { ipcRenderer } = window.require('electron');
            const onInit = (_, value) => setIsInitializing(!!value);
            const onClickThrough = (_, enabled) => setIsClickThrough(!!enabled);
            ipcRenderer.on('session-initializing', onInit);
            ipcRenderer.on('click-through-toggled', onClickThrough);
            return () => {
                ipcRenderer.removeListener('session-initializing', onInit);
                ipcRenderer.removeListener('click-through-toggled', onClickThrough);
            };
        } catch (e) {}
    }, []);

    const handleStart = useCallback(async () => {
        const apiKey = readApiKey().trim();
        if (!apiKey) {
            setShowApiKeyError(true);
            setTimeout(() => setShowApiKeyError(false), 1000);
            return;
        }
        if (!window.cheddar) return;
        await window.cheddar.initializeGemini(selectedProfile, selectedLanguage);
        window.cheddar.startCapture(selectedScreenshotInterval, selectedImageQuality);
        setResponses([]);
        setStartTime(Date.now());
        setCurrentView('assistant');
    }, [selectedProfile, selectedLanguage, selectedScreenshotInterval, selectedImageQuality]);

    async function handleClose() {
        if (!window.require) return;
        const { ipcRenderer } = window.require('electron');
        if (currentView === 'settings') {
            setCurrentView('main');
            return;
        }
        if (currentView === 'assistant') {
            if (window.cheddar) {
                window.cheddar.stopCapture();
            }
            await ipcRenderer.invoke('close-session');
            setCurrentView('main');
            return;
        }
        await ipcRenderer.invoke('quit-application');
    }

    async function handleHide() {
        if (!window.require) return;
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('toggle-window-visibility');
    }

    async function handleAPIKeyHelp() {
        if (!window.require) return;
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('open-external', 'https://cheatingdaddy.com/help/api-key');
    }

    async function handleSendText(message) {
        if (!window.cheddar) return;
        const result = await window.cheddar.sendTextMessage(message);
        if (!result.success) {
            setStatusText('Error sending message: ' + result.error);
        } else {
            setStatusText('Message sent...');
        }
    }

    const rootStyle = {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        height: '100vh',
        backgroundColor: 'var(--background-transparent)',
        color: 'var(--text-color)',
    };

    const containerStyle = {
        height: '100vh',
        borderRadius: 7,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
    };

    const mainContentStyle = {
        flex: 1,
        marginTop: 8,
        borderRadius: 8,
        border: '1px solid var(--border-color)',
        padding: 16,
        background: 'var(--main-content-background)',
        overflowY: 'auto',
        display: 'flex',
    };

    let viewElement;
    if (currentView === 'main') {
        viewElement = React.createElement(MainView, {
            onStart: handleStart,
            onAPIKeyHelp: handleAPIKeyHelp,
            isInitializing,
            showApiKeyError,
        });
    } else if (currentView === 'settings') {
        viewElement = React.createElement(SettingsView, {
            selectedProfile,
            setSelectedProfile,
            selectedLanguage,
            setSelectedLanguage,
            selectedScreenshotInterval,
            setSelectedScreenshotInterval,
            selectedImageQuality,
            setSelectedImageQuality,
            layoutMode,
            setLayoutMode,
            advancedMode,
            setAdvancedMode,
        });
    } else {
        viewElement = React.createElement(AssistantView, {
            responses,
            onSendText: handleSendText,
        });
    }

    return React.createElement(
        'div',
        { style: rootStyle },
        React.createElement(
            'div',
            { style: containerStyle },
            React.createElement(Header, {
                currentView,
                statusText,
                startTime,
                advancedMode,
                isClickThrough,
                onSettings: () => setCurrentView('settings'),
                onClose: handleClose,
                onBack: () => setCurrentView('main'),
                onHide: handleHide,
            }),
            React.createElement('div', { style: mainContentStyle }, viewElement),
        ),
    );
}

function mountReactApp() {
    const rootElement = document.getElementById('cheddar-root');
    if (!rootElement) return;
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(App));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountReactApp);
} else {
    mountReactApp();
}
