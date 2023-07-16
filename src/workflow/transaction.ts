import { fetchPost } from "siyuan";

import { IProtyle } from "siyuan";
import { IOperation } from "@/types";

declare global {
    interface Window {
        siyuan: any;
    }
  }

const TIMEOUT_INPUT = 256

const Lute:any = window.Lute

export const turnsIntoOneTransaction = (options: {
    protyle: IProtyle,
    selectsElement: Element[],
    type: string,
    level?: string
}) => {
    let parentElement: Element;
    const id = Lute.NewNodeID();
    if (options.type.endsWith("Ls")) {
        parentElement = document.createElement("div");
        parentElement.classList.add("list");
        parentElement.setAttribute("data-node-id", id);
        parentElement.setAttribute("data-type", "NodeList");
        if (options.type === "Blocks2ULs") {
            parentElement.setAttribute("data-subtype", "u");
        } else if (options.type === "Blocks2OLs") {
            parentElement.setAttribute("data-subtype", "o");
        } else {
            parentElement.setAttribute("data-subtype", "t");
        }
        let html = "";
        options.selectsElement.forEach((item, index) => {
            if (options.type === "Blocks2ULs") {
                html += `<div data-marker="*" data-subtype="u" data-node-id="${Lute.NewNodeID()}" data-type="NodeListItem" class="li"><div class="protyle-action" draggable="true"><svg><use xlink:href="#iconDot"></use></svg></div><div class="protyle-attr" contenteditable="false"></div></div>`;
            } else if (options.type === "Blocks2OLs") {
                html += `<div data-marker="${index + 1}." data-subtype="o" data-node-id="${Lute.NewNodeID()}" data-type="NodeListItem" class="li"><div class="protyle-action protyle-action--order" contenteditable="false" draggable="true">${index + 1}.</div><div class="protyle-attr" contenteditable="false"></div></div>`;
            } else {
                html += `<div data-marker="*" data-subtype="t" data-node-id="${Lute.NewNodeID()}" data-type="NodeListItem" class="li"><div class="protyle-action protyle-action--task" draggable="true"><svg><use xlink:href="#iconUncheck"></use></svg></div><div class="protyle-attr" contenteditable="false"></div></div>`;
            }
        });
        parentElement.innerHTML = html + '<div class="protyle-attr" contenteditable="false"></div>';
    }
    const previousId = options.selectsElement[0].getAttribute("data-node-id");
    const parentId = options.selectsElement[0].parentElement.getAttribute("data-node-id") || options.protyle.block.parentID;
    const doOperations: IOperation[] = [{
        action: "insert",
        id,
        data: parentElement.outerHTML,
        nextID: previousId,
        parentID: parentId
    }];
    const undoOperations: IOperation[] = [];
    if (options.selectsElement[0].previousElementSibling) {
        options.selectsElement[0].before(parentElement);
    } else {
        options.selectsElement[0].parentElement.prepend(parentElement);
    }
    let itemPreviousId: string;
    options.selectsElement.forEach((item, index) => {
        item.classList.remove("protyle-wysiwyg--select");
        item.removeAttribute("select-start");
        item.removeAttribute("select-end");
        const itemId = item.getAttribute("data-node-id");
        undoOperations.push({
            action: "move",
            id: itemId,
            previousID: itemPreviousId || id,
            parentID: parentId
        });
        if (options.type.endsWith("Ls")) {
            doOperations.push({
                action: "move",
                id: itemId,
                parentID: parentElement.children[index].getAttribute("data-node-id")
            });
            parentElement.children[index].firstElementChild.after(item);
        } else {
            doOperations.push({
                action: "move",
                id: itemId,
                previousID: itemPreviousId,
                parentID: id
            });
            parentElement.lastElementChild.before(item);
        }
        itemPreviousId = item.getAttribute("data-node-id");

        if (index === options.selectsElement.length - 1) {
            undoOperations.push({
                action: "delete",
                id,
            });
        }
        // // 超级块内嵌入块无面包屑，需重新渲染 https://github.com/siyuan-note/siyuan/issues/7574
        // if (item.getAttribute("data-type") === "NodeBlockQueryEmbed") {
        //     item.removeAttribute("data-render");
        //     blockRender(options.protyle, item);
        // }
    });
    transaction(options.protyle, doOperations, undoOperations);
    focusBlock(options.protyle.wysiwyg.element.querySelector(`[data-node-id="${options.selectsElement[0].getAttribute("data-node-id")}"]`));
    hideElements(["gutter"], options.protyle);
};

export const focusBlock = (element: Element, parentElement?: HTMLElement, toStart = true) => {
    if (!element) {
        return false;
    }
    // hr、嵌入块、数学公式、iframe、音频、视频、图表渲染块等，删除段落块后，光标位置矫正 https://github.com/siyuan-note/siyuan/issues/4143
    let cursorElement;
    if (toStart) {
        cursorElement = getContenteditableElement(element);
    } else {
        Array.from(element.querySelectorAll('[contenteditable="true"]')).reverse().find(item => {
            if (item.getBoundingClientRect().width > 0) {
                cursorElement = item;
                return true;
            }
        });
    }
    if (cursorElement) {
        if (cursorElement.tagName === "TABLE") {
            if (toStart) {
                cursorElement = cursorElement.querySelector("th, td");
            } else {
                const cellElements = cursorElement.querySelectorAll("th, td");
                cursorElement = cellElements[cellElements.length - 1];
            }
        }
        let range;
        if (toStart) {
            // 需要定位到第一个 child https://github.com/siyuan-note/siyuan/issues/5930
            range = setFirstNodeRange(cursorElement, getEditorRange(cursorElement));
            range.collapse(true);
        } else {
            // 定位到末尾 https://github.com/siyuan-note/siyuan/issues/5982
            range = setLastNodeRange(cursorElement, getEditorRange(cursorElement));
            range.collapse(false);
        }
        focusByRange(range);
        return range;
    } else if (parentElement) {
        parentElement.focus();
    }
    return false;
};


export const getContenteditableElement = (element: Element) => {
    if (!element || (element.getAttribute("contenteditable") === "true") && !element.classList.contains("protyle-wysiwyg")) {
        return element;
    }
    return element.querySelector('[contenteditable="true"]');
};

export const setFirstNodeRange = (editElement: Element, range: Range) => {
    if (!editElement) {
        return range;
    }
    let firstChild = editElement.firstChild as HTMLElement;
    while (firstChild && firstChild.nodeType !== 3 && !firstChild.classList.contains("render-node")) {
        if (firstChild.classList.contains("img")) { // https://ld246.com/article/1665360254842
            range.setStartBefore(firstChild);
            return range;
        }
        firstChild = firstChild.firstChild as HTMLElement;
    }
    if (!firstChild) {
        range.selectNodeContents(editElement);
        return range;
    }
    if (firstChild.nodeType !== 3 && firstChild.classList.contains("render-node")) {
        range.setStartBefore(firstChild);
    } else {
        range.setStart(firstChild, 0);
    }
    return range;
};

let transactionsTimeout: number;
export const transaction = (protyle: IProtyle, doOperations: IOperation[], undoOperations?: IOperation[]) => {
    const lastTransaction = window.siyuan.transactions[window.siyuan.transactions.length - 1];
    let needDebounce = false;
    const time = new Date().getTime();
    if (lastTransaction && lastTransaction.doOperations.length === 1 && lastTransaction.doOperations[0].action === "update" &&
        doOperations.length === 1 && doOperations[0].action === "update" &&
        lastTransaction.doOperations[0].id === doOperations[0].id &&
        protyle.transactionTime - time < TIMEOUT_INPUT) {
        needDebounce = true;
    }
    protyle.wysiwyg.lastHTMLs = {};
    if (undoOperations) {
        if (window.siyuan.config.fileTree.openFilesUseCurrentTab && protyle.model) {
            protyle.model.headElement.classList.remove("item--unupdate");
        }
        protyle.updated = true;

        if (needDebounce) {
            protyle.undo.replace(doOperations);
        } else {
            protyle.undo.add(doOperations, undoOperations);
        }
    }
    if (needDebounce) {
        // 不能覆盖 undoOperations https://github.com/siyuan-note/siyuan/issues/3727
        window.siyuan.transactions[window.siyuan.transactions.length - 1].protyle = protyle;
        window.siyuan.transactions[window.siyuan.transactions.length - 1].doOperations = doOperations;
    } else {
        window.siyuan.transactions.push({
            protyle,
            doOperations,
            undoOperations
        });
    }
    protyle.transactionTime = time;
    window.clearTimeout(transactionsTimeout);
    transactionsTimeout = window.setTimeout(() => {
        // promiseTransaction();
        saveViaTransaction(protyle)
    }, TIMEOUT_INPUT * 2);
};

export function saveViaTransaction(protyle:IProtyle) {
    // let protyle = document.querySelector(".card__block.fn__flex-1.protyle:not(.fn__none) .protyle-wysiwyg.protyle-wysiwyg--attr")
    // if (protyle === null)
    //     protyle = document.querySelector('.fn__flex-1.protyle:not(.fn__none) .protyle-wysiwyg.protyle-wysiwyg--attr') //需要获取到当前正在编辑的 protyle
    let e = document.createEvent('HTMLEvents')
    e.initEvent('input', true, false)
    protyle.wysiwyg.element.dispatchEvent(e)
  }

export const getEditorRange = (element: Element) => {
    let range: Range;
    if (getSelection().rangeCount > 0) {
        range = getSelection().getRangeAt(0);
        if (element.isSameNode(range.startContainer) || element.contains(range.startContainer)) {
            return range;
        }
    }
    // 代码块过长，在代码块的下一个块前删除，代码块会滚动到顶部，因粗需要 preventScroll
    (element as HTMLElement).focus({preventScroll: true});
    let targetElement;
    if (element.classList.contains("table")) {
        // 当光标不在表格区域中时表格无法被复制 https://ld246.com/article/1650510736504
        targetElement = element.querySelector("th") || element.querySelector("td");
    } else {
        targetElement = getContenteditableElement(element);
        if (!targetElement) {
            targetElement = element;
        } else if (targetElement.tagName === "TABLE") {
            // 文档中开头为表格，获取错误 https://ld246.com/article/1663408335459?r=88250
            targetElement = targetElement.querySelector("th") || element.querySelector("td");
        }
    }
    range = targetElement.ownerDocument.createRange();
    range.setStart(targetElement || element, 0);
    range.collapse(true);
    return range;
};

export const setLastNodeRange = (editElement: Element, range: Range, setStart = true) => {
    if (!editElement) {
        return range;
    }
    let lastNode = editElement.lastChild;
    while (lastNode && lastNode.nodeType !== 3) {
        // 最后一个为多种行内元素嵌套
        lastNode = lastNode.lastChild;
    }
    if (!lastNode) {
        range.selectNodeContents(editElement);
        return range;
    }
    if (setStart) {
        range.setStart(lastNode, lastNode.textContent.length);
    } else {
        range.setEnd(lastNode, lastNode.textContent.length);
    }
    return range;
};

export const focusByRange = (range: Range) => {
    if (!range) {
        return;
    }
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
};

export const hideElements = (panels: string[], protyle?: IProtyle, focusHide = false) => {
    if (!protyle) {
        if (panels.includes("dialog")) {
            for (let i = 0; i < window.siyuan.dialogs.length; i++) {
                window.siyuan.dialogs[i].destroy();
                i--;
            }
        }
        return;
    }
    if (panels.includes("hint")) {
        clearTimeout(protyle.hint.timeId);
        protyle.hint.element.classList.add("fn__none");
    }
    if (protyle.gutter && panels.includes("gutter")) {
        protyle.gutter.element.classList.add("fn__none");
        protyle.gutter.element.innerHTML = "";
        // https://ld246.com/article/1651935412480
        protyle.wysiwyg.element.querySelectorAll(".protyle-wysiwyg--hl").forEach((item) => {
            item.classList.remove("protyle-wysiwyg--hl");
        });
    }
    if (protyle.toolbar && panels.includes("toolbar")) {
        protyle.toolbar.element.classList.add("fn__none");
        protyle.toolbar.element.style.display = "";
    }
    if (protyle.toolbar && panels.includes("util")) {
        const pinElement = protyle.toolbar.subElement.querySelector('[data-type="pin"]');
        if (focusHide || !pinElement || (pinElement && !pinElement.classList.contains("block__icon--active"))) {
            protyle.toolbar.subElement.classList.add("fn__none");
            if (protyle.toolbar.subElementCloseCB) {
                protyle.toolbar.subElementCloseCB();
                protyle.toolbar.subElementCloseCB = undefined;
            }
        }
    }
    if (panels.includes("select")) {
        protyle.wysiwyg.element.querySelectorAll(".protyle-wysiwyg--select").forEach(item => {
            item.classList.remove("protyle-wysiwyg--select");
            item.removeAttribute("select-start");
            item.removeAttribute("select-end");
        });
    }
};

// const promiseTransaction = () => {
//     if (window.siyuan.transactions.length === 0) {
//         return;
//     }
//     const protyle = window.siyuan.transactions[0].protyle;
//     const doOperations = window.siyuan.transactions[0].doOperations;
//     const undoOperations = window.siyuan.transactions[0].undoOperations;
//     // 1. * ;2. * ;3. a
//     // 第一步请求没有返回前在 transaction 中会合并1、2步，此时第一步请求返回将被以下代码删除，在输入a时，就会出现 block not found，因此以下代码不能放入请求回调中
//     window.siyuan.transactions.splice(0, 1);
//     fetchPost("/api/transactions", {
//         session: protyle.id,
//         app: Constants.SIYUAN_APPID,
//         transactions: [{
//             doOperations,
//             undoOperations // 目前用于 ws 推送更新大纲
//         }]
//     }, (response) => {
//         if (window.siyuan.transactions.length === 0) {
//             countBlockWord([], protyle.block.rootID, true);
//         } else {
//             promiseTransaction();
//         }
//         /// #if MOBILE
//         if ((0 !== window.siyuan.config.sync.provider || (0 === window.siyuan.config.sync.provider && !needSubscribe(""))) &&
//             window.siyuan.config.repo.key && window.siyuan.config.sync.enabled) {
//             document.getElementById("toolbarSync").classList.remove("fn__none");
//         }
//         /// #endif
//         if (response.data[0].doOperations[0].action === "setAttrs") {
//             const gutterFoldElement = protyle.gutter.element.querySelector('[data-type="fold"]');
//             if (gutterFoldElement) {
//                 gutterFoldElement.removeAttribute("disabled");
//             }
//             // 仅在 alt+click 箭头折叠时才会触发
//             protyle.wysiwyg.element.querySelectorAll('[data-type="NodeBlockQueryEmbed"]').forEach((item) => {
//                 if (item.querySelector(`[data-node-id="${response.data[0].doOperations[0].id}"]`)) {
//                     item.removeAttribute("data-render");
//                     blockRender(protyle, item);
//                 }
//             });
//             return;
//         }

//         let range: Range;
//         if (getSelection().rangeCount > 0) {
//             range = getSelection().getRangeAt(0);
//         }
//         response.data[0].doOperations.forEach((operation: IOperation) => {
//             if (operation.action === "unfoldHeading" || operation.action === "foldHeading") {
//                 const gutterFoldElement = protyle.gutter.element.querySelector('[data-type="fold"]');
//                 if (gutterFoldElement) {
//                     gutterFoldElement.removeAttribute("disabled");
//                 }
//                 if (operation.action === "unfoldHeading") {
//                     const scrollTop = protyle.contentElement.scrollTop;
//                     protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.id}"]`).forEach(item => {
//                         if (!item.lastElementChild.classList.contains("protyle-attr")) {
//                             item.lastElementChild.remove();
//                         }
//                         removeUnfoldRepeatBlock(operation.retData, protyle);
//                         item.insertAdjacentHTML("afterend", operation.retData);
//                         if (operation.data === "remove") {
//                             // https://github.com/siyuan-note/siyuan/issues/2188
//                             const selection = getSelection();
//                             if (selection.rangeCount > 0 && item.contains(selection.getRangeAt(0).startContainer)) {
//                                 focusBlock(item.nextElementSibling, undefined, true);
//                             }
//                             item.remove();
//                         }
//                     });
//                     processRender(protyle.wysiwyg.element);
//                     highlightRender(protyle.wysiwyg.element);
//                     avRender(protyle.wysiwyg.element);
//                     blockRender(protyle, protyle.wysiwyg.element);
//                     protyle.contentElement.scrollTop = scrollTop;
//                     protyle.scroll.lastScrollTop = scrollTop;
//                     return;
//                 }
//                 // 折叠标题后未触发动态加载 https://github.com/siyuan-note/siyuan/issues/4168
//                 if (protyle.wysiwyg.element.lastElementChild.getAttribute("data-eof") !== "2" &&
//                     !protyle.scroll.element.classList.contains("fn__none") &&
//                     protyle.contentElement.scrollHeight - protyle.contentElement.scrollTop < protyle.contentElement.clientHeight * 2    // https://github.com/siyuan-note/siyuan/issues/7785
//                 ) {
//                     fetchPost("/api/filetree/getDoc", {
//                         id: protyle.wysiwyg.element.lastElementChild.getAttribute("data-node-id"),
//                         mode: 2,
//                         size: window.siyuan.config.editor.dynamicLoadBlocks,
//                     }, getResponse => {
//                         onGet({
//                             data: getResponse,
//                             protyle,
//                             action: [Constants.CB_GET_APPEND, Constants.CB_GET_UNCHANGEID],
//                         });
//                     });
//                 }
//                 return;
//             }
//             if (operation.action === "update") {
//                 if (protyle.options.backlinkData) {
//                     // 反链中有多个相同块的情况
//                     Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.id}"]`)).forEach(item => {
//                         if (item.getAttribute("data-type") === "NodeBlockQueryEmbed" ||
//                             !hasClosestByAttribute(item, "data-type", "NodeBlockQueryEmbed")) {
//                             if (range && (item.isSameNode(range.startContainer) || item.contains(range.startContainer))) {
//                                 // 正在编辑的块不能进行更新
//                             } else {
//                                 item.outerHTML = operation.data.replace("<wbr>", "");
//                             }
//                         }
//                     });
//                     processRender(protyle.wysiwyg.element);
//                     highlightRender(protyle.wysiwyg.element);
//                     avRender(protyle.wysiwyg.element);
//                     blockRender(protyle, protyle.wysiwyg.element);
//                 }
//                 // 当前编辑器中更新嵌入块
//                 updateEmbed(protyle, operation);
//                 // 更新引用块
//                 updateRef(protyle, operation.id);
//                 return;
//             }
//             if (operation.action === "delete" || operation.action === "append") {
//                 if (protyle.options.backlinkData) {
//                     Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.id}"]`)).forEach(item => {
//                         if (!hasClosestByAttribute(item, "data-type", "NodeBlockQueryEmbed")) {
//                             item.remove();
//                         }
//                     });
//                 }
//                 // 更新嵌入块
//                 protyle.wysiwyg.element.querySelectorAll('[data-type="NodeBlockQueryEmbed"]').forEach((item) => {
//                     if (item.querySelector(`[data-node-id="${operation.id}"]`)) {
//                         item.removeAttribute("data-render");
//                         blockRender(protyle, item);
//                     }
//                 });
//                 return;
//             }
//             if (operation.action === "move") {
//                 if (protyle.options.backlinkData) {
//                     const updateElements: Element[] = [];
//                     Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.id}"]`)).forEach(item => {
//                         if (item.getAttribute("data-type") === "NodeBlockQueryEmbed" || !hasClosestByAttribute(item, "data-type", "NodeBlockQueryEmbed")) {
//                             updateElements.push(item);
//                             return;
//                         }
//                     });
//                     let hasFind = false;
//                     if (operation.previousID && updateElements.length > 0) {
//                         Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.previousID}"]`)).forEach(item => {
//                             if (item.getAttribute("data-type") === "NodeBlockQueryEmbed" || !hasClosestByAttribute(item.parentElement, "data-type", "NodeBlockQueryEmbed")) {
//                                 item.after(updateElements[0].cloneNode(true));
//                                 hasFind = true;
//                             }
//                         });
//                     } else if (updateElements.length > 0) {
//                         Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.parentID}"]`)).forEach(item => {
//                             if (item.getAttribute("data-type") === "NodeBlockQueryEmbed" || !hasClosestByAttribute(item.parentElement, "data-type", "NodeBlockQueryEmbed")) {
//                                 // 列表特殊处理
//                                 if (item.firstElementChild?.classList.contains("protyle-action")) {
//                                     item.firstElementChild.after(updateElements[0].cloneNode(true));
//                                 } else {
//                                     item.prepend(updateElements[0].cloneNode(true));
//                                 }
//                                 hasFind = true;
//                             }
//                         });
//                     }
//                     updateElements.forEach(item => {
//                         if (hasFind) {
//                             item.remove();
//                         } else if (!hasFind && item.parentElement) {
//                             removeTopElement(item, protyle);
//                         }
//                     });
//                 }
//                 // 更新嵌入块
//                 protyle.wysiwyg.element.querySelectorAll('[data-type="NodeBlockQueryEmbed"]').forEach((item) => {
//                     if (item.querySelector(`[data-node-id="${operation.id}"]`)) {
//                         item.removeAttribute("data-render");
//                         blockRender(protyle, item);
//                     }
//                 });
//                 return;
//             }
//             if (operation.action === "insert") {
//                 // insert
//                 if (protyle.options.backlinkData) {
//                     const cursorElements: Element[] = [];
//                     if (operation.previousID) {
//                         Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.previousID}"]`)).forEach(item => {
//                             if (item.nextElementSibling?.getAttribute("data-node-id") !== operation.id &&
//                                 !hasClosestByAttribute(item, "data-node-id", operation.id) && // 段落转列表会在段落后插入新列表
//                                 (item.getAttribute("data-type") === "NodeBlockQueryEmbed" || !hasClosestByAttribute(item.parentElement, "data-type", "NodeBlockQueryEmbed"))) {
//                                 item.insertAdjacentHTML("afterend", operation.data);
//                                 cursorElements.push(item.nextElementSibling);
//                             }
//                         });
//                     } else {
//                         Array.from(protyle.wysiwyg.element.querySelectorAll(`[data-node-id="${operation.parentID}"]`)).forEach(item => {
//                             if (item.getAttribute("data-type") === "NodeBlockQueryEmbed" || !hasClosestByAttribute(item.parentElement, "data-type", "NodeBlockQueryEmbed")) {
//                                 // 列表特殊处理
//                                 if (item.firstElementChild && item.firstElementChild.classList.contains("protyle-action") &&
//                                     item.firstElementChild.nextElementSibling.getAttribute("data-node-id") !== operation.id) {
//                                     item.firstElementChild.insertAdjacentHTML("afterend", operation.data);
//                                     cursorElements.push(item.firstElementChild.nextElementSibling);
//                                 } else if (item.firstElementChild && item.firstElementChild.getAttribute("data-node-id") !== operation.id) {
//                                     item.insertAdjacentHTML("afterbegin", operation.data);
//                                     cursorElements.push(item.firstElementChild);
//                                 }
//                             }
//                         });
//                     }
//                     // https://github.com/siyuan-note/siyuan/issues/4420
//                     protyle.wysiwyg.element.querySelectorAll('[data-type="NodeHeading"]').forEach(item => {
//                         if (item.lastElementChild.getAttribute("spin") === "1") {
//                             item.lastElementChild.remove();
//                         }
//                     });
//                     cursorElements.forEach(item => {
//                         processRender(item);
//                         highlightRender(item);
//                         avRender(item);
//                         blockRender(protyle, item);
//                         const wbrElement = item.querySelector("wbr");
//                         if (wbrElement) {
//                             wbrElement.remove();
//                         }
//                     });
//                 }
//                 // 不更新嵌入块：在快速删除时重新渲染嵌入块会导致滚动条产生滚动从而触发 getDoc 请求，此时删除的块还没有写库，会把已删除的块 append 到文档底部，最终导致查询块失败、光标丢失
//                 // protyle.wysiwyg.element.querySelectorAll('[data-type="NodeBlockQueryEmbed"]').forEach((item) => {
//                 //     if (item.getAttribute("data-node-id") === operation.id) {
//                 //         item.removeAttribute("data-render");
//                 //         blockRender(protyle, item);
//                 //     }
//                 // });
//                 // 更新引用块
//                 updateRef(protyle, operation.id);
//             }
//         });
//     });
// };
