export const getDomRange = () => {
    const selection = window.getSelection();

    if (selection.isCollapsed) {
        return null;
    }

    return selection.getRangeAt(0);
};