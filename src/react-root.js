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

const KEYBIND_ACTIONS = [
    { key: 'moveUp', name: 'Move Window Up', description: 'Move the application window up' },
    { key: 'moveDown', name: 'Move Window Down', description: 'Move the application window down' },
    { key: 'moveLeft', name: 'Move Window Left', description: 'Move the application window left' },
    { key: 'moveRight', name: 'Move Window Right', description: 'Move the application window right' },
    { key: 'toggleVisibility', name: 'Toggle Window Visibility', description: 'Show or hide the application window' },
    {
        key: 'toggleClickThrough',
        name: 'Toggle Click-through Mode',
        description: 'Enable or disable click-through for the window',
    },
    {
        key: 'nextStep',
        name: 'Ask Next Step',
        description: 'Take a screenshot and ask AI for the next step suggestion',
    },
    { key: 'previousResponse', name: 'Previous Response', description: 'Navigate to the previous AI response' },
    { key: 'nextResponse', name: 'Next Response', description: 'Navigate to the next AI response' },
    { key: 'scrollUp', name: 'Scroll Response Up', description: 'Scroll the AI response content up' },
    { key: 'scrollDown', name: 'Scroll Response Down', description: 'Scroll the AI response content down' },
];

function getDefaultKeybinds() {
    const isMac =
        (typeof window !== 'undefined' && window.cheddar && window.cheddar.isMacOS) ||
        (typeof navigator !== 'undefined' && navigator.platform.includes('Mac'));

    return {
        moveUp: isMac ? 'Alt+Up' : 'Ctrl+Up',
        moveDown: isMac ? 'Alt+Down' : 'Ctrl+Down',
        moveLeft: isMac ? 'Alt+Left' : 'Ctrl+Left',
        moveRight: isMac ? 'Alt+Right' : 'Ctrl+Right',
        toggleVisibility: isMac ? 'Cmd+\\' : 'Ctrl+\\',
        toggleClickThrough: isMac ? 'Cmd+M' : 'Ctrl+M',
        nextStep: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
        previousResponse: isMac ? 'Cmd+[' : 'Ctrl+[',
        nextResponse: isMac ? 'Cmd+]' : 'Ctrl+]',
        scrollUp: isMac ? 'Cmd+Shift+Up' : 'Ctrl+Shift+Up',
        scrollDown: isMac ? 'Cmd+Shift+Down' : 'Ctrl+Shift+Down',
    };
}

function Header(props) {
    const {
        currentView,
        statusText,
        startTime,
        advancedMode,
        isClickThrough,
        onSettings,
        onHelp,
        onHistory,
        onAdvanced,
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
        help: 'Help & Shortcuts',
        history: 'Conversation History',
        advanced: 'Advanced Tools',
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
                      React.Fragment,
                      null,
                      React.createElement(
                          'button',
                          { style: buttonStyle, onClick: onHistory },
                          'History',
                      ),
                      advancedMode
                          ? React.createElement(
                                'button',
                                { style: buttonStyle, onClick: onAdvanced },
                                'Advanced',
                            )
                          : null,
                      React.createElement(
                          'button',
                          { style: buttonStyle, onClick: onHelp },
                          'Help',
                      ),
                      React.createElement(
                          'button',
                          { style: buttonStyle, onClick: onSettings },
                          'Settings',
                      ),
                  )
                : null,
            currentView === 'assistant'
                ? React.createElement(
                      'button',
                      { style: iconButtonStyle, onClick: onClose },
                      'X',
                  )
                : React.createElement(
                      'button',
                      { style: iconButtonStyle, onClick: currentView === 'main' ? onClose : onBack },
                      currentView === 'main' ? 'X' : 'Back',
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

    const [customPrompt, setCustomPrompt] = useState(() => {
        try {
            return localStorage.getItem('customPrompt') || '';
        } catch (e) {
            return '';
        }
    });

    const [audioMode, setAudioMode] = useState(() => {
        try {
            return localStorage.getItem('audioMode') || 'speaker_only';
        } catch (e) {
            return 'speaker_only';
        }
    });

    const [stealthProfile, setStealthProfile] = useState(() => {
        try {
            return localStorage.getItem('stealthProfile') || 'balanced';
        } catch (e) {
            return 'balanced';
        }
    });

    const [googleSearchEnabled, setGoogleSearchEnabled] = useState(() => {
        try {
            const stored = localStorage.getItem('googleSearchEnabled');
            return stored === null ? true : stored === 'true';
        } catch (e) {
            return true;
        }
    });

    const [backgroundTransparency, setBackgroundTransparency] = useState(() => {
        try {
            const stored = localStorage.getItem('backgroundTransparency');
            return stored !== null ? parseFloat(stored) || 0.8 : 0.8;
        } catch (e) {
            return 0.8;
        }
    });

    const [fontSize, setFontSize] = useState(() => {
        try {
            const stored = localStorage.getItem('fontSize');
            return stored !== null ? parseInt(stored, 10) || 20 : 20;
        } catch (e) {
            return 20;
        }
    });

    const [keybinds, setKeybinds] = useState(() => {
        try {
            const saved = localStorage.getItem('customKeybinds');
            if (saved) {
                return { ...getDefaultKeybinds(), ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load saved keybinds:', e);
        }
        return getDefaultKeybinds();
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--header-background', `rgba(0, 0, 0, ${backgroundTransparency})`);
        root.style.setProperty('--main-content-background', `rgba(0, 0, 0, ${backgroundTransparency})`);
        root.style.setProperty('--card-background', `rgba(255, 255, 255, ${backgroundTransparency * 0.05})`);
        root.style.setProperty('--input-background', `rgba(0, 0, 0, ${backgroundTransparency * 0.375})`);
        root.style.setProperty('--input-focus-background', `rgba(0, 0, 0, ${backgroundTransparency * 0.625})`);
        root.style.setProperty('--button-background', `rgba(0, 0, 0, ${backgroundTransparency * 0.625})`);
        root.style.setProperty('--preview-video-background', `rgba(0, 0, 0, ${backgroundTransparency * 1.125})`);
        root.style.setProperty('--screen-option-background', `rgba(0, 0, 0, ${backgroundTransparency * 0.5})`);
        root.style.setProperty('--screen-option-hover-background', `rgba(0, 0, 0, ${backgroundTransparency * 0.75})`);
        root.style.setProperty('--scrollbar-background', `rgba(0, 0, 0, ${backgroundTransparency * 0.5})`);
    }, [backgroundTransparency]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--response-font-size', `${fontSize}px`);
    }, [fontSize]);

    function saveKeybinds(updated) {
        try {
            localStorage.setItem('customKeybinds', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save keybinds:', e);
        }
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('update-keybinds', updated);
            } catch (error) {
                console.error('Failed to notify main process about keybinds:', error);
            }
        }
    }

    function handleKeybindChange(actionKey, value) {
        const updated = { ...keybinds, [actionKey]: value };
        setKeybinds(updated);
        saveKeybinds(updated);
    }

    function handleResetKeybinds() {
        const defaults = getDefaultKeybinds();
        setKeybinds(defaults);
        try {
            localStorage.removeItem('customKeybinds');
        } catch (e) {}
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('update-keybinds', defaults);
            } catch (error) {
                console.error('Failed to reset keybinds in main process:', error);
            }
        }
    }

    function handleKeybindFocus(e) {
        e.target.placeholder = 'Press key combination...';
        if (typeof e.target.select === 'function') {
            e.target.select();
        }
    }

    function handleKeybindKeyDown(actionKey, e) {
        e.preventDefault();

        const modifiers = [];

        if (e.ctrlKey) modifiers.push('Ctrl');
        if (e.metaKey) modifiers.push('Cmd');
        if (e.altKey) modifiers.push('Alt');
        if (e.shiftKey) modifiers.push('Shift');

        let mainKey = e.key;

        switch (e.code) {
            case 'ArrowUp':
                mainKey = 'Up';
                break;
            case 'ArrowDown':
                mainKey = 'Down';
                break;
            case 'ArrowLeft':
                mainKey = 'Left';
                break;
            case 'ArrowRight':
                mainKey = 'Right';
                break;
            case 'Enter':
                mainKey = 'Enter';
                break;
            case 'Space':
                mainKey = 'Space';
                break;
            case 'Backslash':
                mainKey = '\\';
                break;
            case 'KeyS':
                if (e.shiftKey) mainKey = 'S';
                break;
            case 'KeyM':
                mainKey = 'M';
                break;
            default:
                if (e.key && e.key.length === 1) {
                    mainKey = e.key.toUpperCase();
                }
                break;
        }

        if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
            return;
        }

        const keybind = [...modifiers, mainKey].join('+');
        handleKeybindChange(actionKey, keybind);
    }

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

    const descriptionStyle = {
        fontSize: 11,
        color: 'var(--description-color)',
        marginTop: 4,
    };

    const textAreaStyle = {
        ...selectStyle,
        minHeight: 60,
        resize: 'vertical',
    };

    const sliderRowStyle = {
        marginTop: 12,
    };

    const sliderHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    };

    const sliderValueStyle = {
        fontSize: 11,
        padding: '2px 6px',
        borderRadius: 3,
        border: '1px solid rgba(52, 211, 153, 0.4)',
    };

    const rangeInputStyle = {
        width: '100%',
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
        { value: 'en-AU', label: 'English (Australia)' },
        { value: 'en-IN', label: 'English (India)' },
        { value: 'de-DE', label: 'German (Germany)' },
        { value: 'es-US', label: 'Spanish (United States)' },
        { value: 'es-ES', label: 'Spanish (Spain)' },
        { value: 'fr-FR', label: 'French (France)' },
        { value: 'fr-CA', label: 'French (Canada)' },
        { value: 'hi-IN', label: 'Hindi (India)' },
        { value: 'pt-BR', label: 'Portuguese (Brazil)' },
        { value: 'ar-XA', label: 'Arabic (Generic)' },
        { value: 'id-ID', label: 'Indonesian (Indonesia)' },
        { value: 'it-IT', label: 'Italian (Italy)' },
        { value: 'ja-JP', label: 'Japanese (Japan)' },
        { value: 'tr-TR', label: 'Turkish (Turkey)' },
        { value: 'vi-VN', label: 'Vietnamese (Vietnam)' },
        { value: 'bn-IN', label: 'Bengali (India)' },
        { value: 'gu-IN', label: 'Gujarati (India)' },
        { value: 'kn-IN', label: 'Kannada (India)' },
        { value: 'ml-IN', label: 'Malayalam (India)' },
        { value: 'mr-IN', label: 'Marathi (India)' },
        { value: 'ta-IN', label: 'Tamil (India)' },
        { value: 'te-IN', label: 'Telugu (India)' },
        { value: 'nl-NL', label: 'Dutch (Netherlands)' },
        { value: 'ko-KR', label: 'Korean (South Korea)' },
        { value: 'cmn-CN', label: 'Mandarin Chinese (China)' },
        { value: 'pl-PL', label: 'Polish (Poland)' },
        { value: 'ru-RU', label: 'Russian (Russia)' },
        { value: 'th-TH', label: 'Thai (Thailand)' },
    ];

    const intervals = [
        { value: 'manual', label: 'Manual (on demand)' },
        { value: '1', label: 'Every 1s' },
        { value: '2', label: 'Every 2s' },
        { value: '5', label: 'Every 5s' },
        { value: '10', label: 'Every 10s' },
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

    function handleCustomPromptChange(e) {
        const value = e.target.value;
        setCustomPrompt(value);
        saveLocalStorage('customPrompt', value);
    }

    function handleAudioModeChange(e) {
        const value = e.target.value;
        setAudioMode(value);
        saveLocalStorage('audioMode', value);
    }

    function handleStealthProfileChange(e) {
        const value = e.target.value;
        setStealthProfile(value);
        saveLocalStorage('stealthProfile', value);
        try {
            alert('Restart the application for stealth changes to take full effect.');
        } catch (e2) {}
    }

    async function handleGoogleSearchChange(e) {
        const checked = e.target.checked;
        setGoogleSearchEnabled(checked);
        saveLocalStorage('googleSearchEnabled', checked.toString());
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('update-google-search-setting', checked);
            } catch (error) {
                console.error('Failed to update Google Search setting:', error);
            }
        }
    }

    function handleBackgroundTransparencyChange(e) {
        const value = parseFloat(e.target.value);
        setBackgroundTransparency(value);
        saveLocalStorage('backgroundTransparency', value.toString());
    }

    function handleFontSizeChange(e) {
        const value = parseInt(e.target.value, 10) || 20;
        setFontSize(value);
        saveLocalStorage('fontSize', value.toString());
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
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Custom AI instructions'),
                React.createElement('textarea', {
                    style: textAreaStyle,
                    rows: 4,
                    value: customPrompt,
                    onChange: handleCustomPromptChange,
                    placeholder: 'Add specific instructions for how you want the AI to behave...',
                }),
                React.createElement(
                    'p',
                    { style: descriptionStyle },
                    'These instructions are added on top of the selected profile prompts.',
                ),
            ),
        ),
        React.createElement(
            'div',
            { style: cardStyle },
            React.createElement('div', { style: { ...labelStyle, textTransform: 'uppercase', marginBottom: 12 } }, 'Audio & Stealth'),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Audio mode'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: audioMode, onChange: handleAudioModeChange },
                    React.createElement('option', { value: 'speaker_only' }, 'Speaker Only (Interviewer)'),
                    React.createElement('option', { value: 'mic_only' }, 'Microphone Only (Me)'),
                    React.createElement('option', { value: 'both' }, 'Both Speaker & Microphone'),
                ),
            ),
            React.createElement(
                'p',
                { style: descriptionStyle },
                'Choose which audio sources to capture for the AI.',
            ),
            React.createElement(
                'label',
                null,
                React.createElement('span', { style: labelStyle }, 'Stealth profile'),
                React.createElement(
                    'select',
                    { style: selectStyle, value: stealthProfile, onChange: handleStealthProfileChange },
                    React.createElement('option', { value: 'visible' }, 'Visible'),
                    React.createElement('option', { value: 'balanced' }, 'Balanced'),
                    React.createElement('option', { value: 'ultra' }, 'Ultra-stealth'),
                ),
            ),
            React.createElement(
                'p',
                { style: descriptionStyle },
                'A restart is recommended for some stealth changes to fully apply.',
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
            React.createElement(
                'div',
                { style: sliderRowStyle },
                React.createElement(
                    'div',
                    { style: sliderHeaderStyle },
                    React.createElement('span', { style: labelStyle }, 'Background transparency'),
                    React.createElement(
                        'span',
                        { style: sliderValueStyle },
                        `${Math.round(backgroundTransparency * 100)}%`,
                    ),
                ),
                React.createElement('input', {
                    type: 'range',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    value: backgroundTransparency,
                    onChange: handleBackgroundTransparencyChange,
                    style: rangeInputStyle,
                }),
            ),
            React.createElement(
                'div',
                { style: sliderRowStyle },
                React.createElement(
                    'div',
                    { style: sliderHeaderStyle },
                    React.createElement('span', { style: labelStyle }, 'Response font size'),
                    React.createElement(
                        'span',
                        { style: sliderValueStyle },
                        `${fontSize}px`,
                    ),
                ),
                React.createElement('input', {
                    type: 'range',
                    min: 12,
                    max: 32,
                    step: 1,
                    value: fontSize,
                    onChange: handleFontSizeChange,
                    style: rangeInputStyle,
                }),
            ),
        ),
        React.createElement(
            'div',
            { style: cardStyle },
            React.createElement('div', { style: { ...labelStyle, textTransform: 'uppercase', marginBottom: 12 } }, 'Keyboard Shortcuts'),
            React.createElement(
                'table',
                {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: 8,
                        fontSize: 11,
                    },
                },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            {
                                style: {
                                    textAlign: 'left',
                                    padding: '6px 8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                },
                            },
                            'Action',
                        ),
                        React.createElement(
                            'th',
                            {
                                style: {
                                    textAlign: 'left',
                                    padding: '6px 8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                },
                            },
                            'Shortcut',
                        ),
                    ),
                ),
                React.createElement(
                    'tbody',
                    null,
                    KEYBIND_ACTIONS.map(action =>
                        React.createElement(
                            'tr',
                            { key: action.key },
                            React.createElement(
                                'td',
                                {
                                    style: {
                                        padding: '6px 8px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    },
                                },
                                React.createElement(
                                    'div',
                                    { style: { fontWeight: 500, fontSize: 12 } },
                                    action.name,
                                ),
                                React.createElement(
                                    'div',
                                    { style: { fontSize: 10, color: 'var(--description-color)' } },
                                    action.description,
                                ),
                            ),
                            React.createElement(
                                'td',
                                {
                                    style: {
                                        padding: '6px 8px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    },
                                },
                                React.createElement('input', {
                                    type: 'text',
                                    value: keybinds[action.key] || '',
                                    placeholder: 'Press keys...',
                                    onKeyDown: e => handleKeybindKeyDown(action.key, e),
                                    onFocus: handleKeybindFocus,
                                    readOnly: true,
                                    style: {
                                        ...selectStyle,
                                        textAlign: 'center',
                                        fontFamily:
                                            "SF Mono, Monaco, 'Inconsolata', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace",
                                        fontSize: 11,
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                    },
                                }),
                            ),
                        ),
                    ),
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'td',
                            {
                                colSpan: 2,
                                style: {
                                    padding: '8px',
                                    paddingTop: 10,
                                },
                            },
                            React.createElement(
                                'button',
                                {
                                    onClick: handleResetKeybinds,
                                    style: {
                                        background: 'var(--button-background)',
                                        color: 'var(--text-color)',
                                        border: '1px solid var(--button-border)',
                                        padding: '6px 10px',
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                    },
                                },
                                'Reset to Defaults',
                            ),
                            React.createElement(
                                'div',
                                { style: { ...descriptionStyle, marginTop: 8 } },
                                'Restore all keyboard shortcuts to their default values',
                            ),
                        ),
                    ),
                ),
            ),
        ),
        React.createElement(
            'div',
            { style: cardStyle },
            React.createElement('div', { style: { ...labelStyle, textTransform: 'uppercase', marginBottom: 12 } }, 'Google Search'),
            React.createElement(
                'div',
                { style: checkboxRowStyle },
                React.createElement('input', {
                    type: 'checkbox',
                    checked: googleSearchEnabled,
                    onChange: handleGoogleSearchChange,
                }),
                React.createElement(
                    'span',
                    { style: { fontSize: 12 } },
                    'Allow the AI to search Google for up-to-date information',
                ),
            ),
            React.createElement(
                'p',
                { style: descriptionStyle },
                'Takes effect when you start a new session.',
            ),
        ),
    );
}

function AssistantView(props) {
    const { chatMessages, onSendText, transcription } = props;
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [chatMessages, transcription]);

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
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
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

    const messageRowStyle = isUser => ({
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 8,
    });

    const bubbleBaseStyle = {
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: 10,
        fontSize: 14,
        lineHeight: 1.5,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    };

    const userBubbleStyle = {
        ...bubbleBaseStyle,
        background: 'var(--text-input-button-background)',
        color: '#ffffff',
        borderTopRightRadius: 2,
    };

    const assistantBubbleStyle = {
        ...bubbleBaseStyle,
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid var(--border-color)',
        borderTopLeftRadius: 2,
    };

    const allMessages = Array.isArray(chatMessages) ? chatMessages.slice() : [];

    if (transcription && transcription.trim().length > 0) {
        allMessages.push({ id: 'live-transcription', role: 'user', text: transcription.trim() });
    }

    function renderMessageContent(message) {
        if (message.role === 'assistant') {
            let html = message.text || '';
            if (typeof window !== 'undefined' && window.marked && html) {
                try {
                    window.marked.setOptions({ breaks: true, gfm: true, sanitize: false });
                    html = window.marked.parse(html);
                } catch (e) {}
            }
            return React.createElement('div', { dangerouslySetInnerHTML: { __html: html } });
        }
        return React.createElement('div', null, message.text || '');
    }

    return React.createElement(
        'div',
        { style: containerStyle },
        React.createElement(
            'div',
            {
                style: responseStyle,
                ref: containerRef,
            },
            allMessages.length === 0
                ? React.createElement(
                      'div',
                      { style: { fontSize: 13, opacity: 0.7 } },
                      'Start speaking or type a message to begin the conversation.',
                  )
                : allMessages.map(message => {
                      const isUser = message.role === 'user';
                      return React.createElement(
                          'div',
                          { key: message.id, style: messageRowStyle(isUser) },
                          React.createElement(
                              'div',
                              { style: isUser ? userBubbleStyle : assistantBubbleStyle },
                              renderMessageContent(message),
                          ),
                      );
                  }),
        ),
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
                'Send',
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
    const [transcription, setTranscription] = useState('');
    const [userMessages, setUserMessages] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
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

        function setTranscriptionFromCheddar(text) {
            setTranscription(text || '');
        }

        function addConversationTurnFromCheddar(turn) {
            if (!turn) return;
            const userText = (turn.transcription || '').trim();
            const aiText = (turn.ai_response || '').trim();
            const timestamp = turn.timestamp || Date.now();

            setChatMessages(prev => {
                const next = prev.slice();
                if (userText) {
                    next.push({ id: `${timestamp}-user`, role: 'user', text: userText });
                }
                if (aiText) {
                    next.push({ id: `${timestamp}-assistant`, role: 'assistant', text: aiText });
                }
                return next;
            });
        }

        const ui = {
            getCurrentView: () => viewRef.current,
            getLayoutMode: () => layoutRef.current,
            setStatus: setStatusFromCheddar,
            setResponse: setResponseFromCheddar,
            setTranscription: setTranscriptionFromCheddar,
            addConversationTurn: addConversationTurnFromCheddar,
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

    async function handleExternalLink(url) {
        if (!window.require) return;
        const { ipcRenderer } = window.require('electron');
        try {
            await ipcRenderer.invoke('open-external', url);
        } catch (e) {}
    }

    async function handleSendText(message) {
        if (!window.cheddar) return;
        const result = await window.cheddar.sendTextMessage(message);
        if (!result.success) {
            setStatusText('Error sending message: ' + result.error);
        } else {
            setStatusText('Message sent...');
            setUserMessages(prev => [...prev, message]);
            setChatMessages(prev => [
                ...prev,
                { id: `${Date.now()}-user-text`, role: 'user', text: message },
            ]);
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
    } else if (currentView === 'help') {
        viewElement = React.createElement('help-view', {
            onExternalLinkClick: handleExternalLink,
            style: { width: '100%', height: '100%' },
        });
    } else if (currentView === 'history') {
        viewElement = React.createElement('history-view', {
            style: { width: '100%', height: '100%' },
        });
    } else if (currentView === 'advanced') {
        viewElement = React.createElement('advanced-view', {
            style: { width: '100%', height: '100%' },
        });
    } else {
        viewElement = React.createElement(AssistantView, {
            chatMessages,
            onSendText: handleSendText,
            transcription,
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
                onHelp: () => setCurrentView('help'),
                onHistory: () => setCurrentView('history'),
                onAdvanced: () => setCurrentView('advanced'),
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
