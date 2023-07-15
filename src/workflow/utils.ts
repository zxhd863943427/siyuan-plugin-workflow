import { Protyle } from "siyuan"
import { fetchSyncPost } from "siyuan"
import { sql, updateBlock } from "@/api"
import { error } from "@/utils"
export let Lute = globalThis.Lute

export function getParentElementById(dataId:string):Element|null{
    // let currentPage = getCurrentPage()
    let sourceElement = document.querySelector(`[data-node-id][data-type]:has(>div[data-node-id="${dataId}"][data-type])`)
    return sourceElement
}

export function getElementById(dataId:string):Element|null{
    // let currentPage = getCurrentPage()
    let sourceElement = document.querySelector(`div[data-node-id="${dataId}"][data-type]`)
    return sourceElement
}

export function getDataNodeId(item:any):string|null{
    if (item.data === null || (typeof(item.data)) != "string") {
        return null
    }
    // let element = document.createElement("div")
    // element.innerHTML = item.data
    // let dataId = (element.childNodes[0] as HTMLElement).getAttribute("data-node-id")
    let dataIDRegx = /data-node-id\s?=\s?"(\d{14}-.{7})"/
    let match = dataIDRegx.exec(item.data)
    let dataId;
    if (match == null){
        return null
    }
    dataId = match[1]
    return dataId
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

const getContenteditableElement = (element: Element) => {
    if (!element || (element.getAttribute("contenteditable") === "true") && !element.classList.contains("protyle-wysiwyg")) {
        return element;
    }
    return element.querySelector('[contenteditable="true"]');
};

const hasClosestBlock = (element: Node) => {
    const nodeElement = hasClosestByAttribute(element, "data-node-id", null);
    if (nodeElement && nodeElement.tagName !== "BUTTON" && nodeElement.getAttribute("data-type")?.startsWith("Node")) {
        return nodeElement;
    }
    return false;
};

const hasClosestByAttribute = (element: Node, attr: string, value: string | null, top = false) => {
    if (!element) {
        return false;
    }
    if (element.nodeType === 3) {
        element = element.parentElement;
    }
    let e = element as HTMLElement;
    let isClosest = false;
    while (e && !isClosest && (top ? e.tagName !== "BODY" : !e.classList.contains("protyle-wysiwyg"))) {
        if (typeof value === "string" && e.getAttribute(attr)?.split(" ").includes(value)) {
            isClosest = true;
        } else if (typeof value !== "string" && e.hasAttribute(attr)) {
            isClosest = true;
        } else {
            e = e.parentElement;
        }
    }
    return isClosest && e;
};

export function getProtyleCurrentElement(protyle:Protyle){
    const range = getEditorRange(protyle.protyle.wysiwyg.element);
    let blockElement = hasClosestBlock(range.startContainer) as Element;
    if (!blockElement) {
        // 使用鼠标点击选则模版提示列表后 range 丢失
        if (protyle.protyle.toolbar.range) {
            blockElement = hasClosestBlock(protyle.protyle.toolbar.range.startContainer) as Element;
        } else {
            blockElement = protyle.protyle.wysiwyg.element.firstElementChild as Element;
        }
    }
    if (!blockElement) {
        return false;
    }
    return blockElement
}

async function queryMd(id:string) {
    let md = await fetchSyncPost("/api/query/sql", {
        "stmt": `SELECT markdown FROM blocks WHERE id ='${id}'`
    })
    if (md.code === 0 && md.data.length != 0) {
        return md.data[0]
    }
    return null
}

export async function turnIntoTask(id:string){
    let query = await queryMd(id)
    if (!query){
        error(`未能找到的 ${id} 的markdown内容`)
        return
    }
    let md = "* [ ] "+query.markdown
    updateBlock("markdown",md,id)
}

export function getProtyleElementById(protyle:Protyle,dataId:string){
    let sourceElement = protyle.protyle.wysiwyg.element.querySelector(`div[data-node-id="${dataId}"][data-type]`)
    return sourceElement
}
