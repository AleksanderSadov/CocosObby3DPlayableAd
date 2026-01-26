interface MRAID {
    open: (url: string) => void;
}

interface Window {
    mraid?: MRAID;
}