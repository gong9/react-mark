import React, { useEffect, useRef } from 'react';
import { getDomRange } from '../util.js/getDomRange.js'
import './index.css'

const Mark = (props) => {
    const { children } = props
    const markRef = useRef()


    useEffect(() => {
        if (localStorage.getItem('markDom')) {
            JSON.parse(localStorage.getItem('markDom')).forEach(
                node => {
                    console.log(node)
                    console.log(parseToDOM(deSerialize(node)))
                }
            )
        }
    })
    let allMarkArr = []
    let markArr = []
    let data = []
    let flag = 0
    let allTextNode = []
    useEffect(() => {
        allMarkArr = []
    }, [])

    /**
     * 
     * @param {*} node
     * 进行包裹 
     */
    const parseToDOM = (node) => {

        const parentNode = node.parentNode
        // 这个情况我现在也不知道是哪里出来的bug
        if (parentNode) {
            const span = document.createElement("span");
            const newNode = node.cloneNode(true);
            span.appendChild(newNode)
            span.className = 'mark'
            parentNode.replaceChild(span, node)
        }

    }

    /**
     * 获取选取的dom信息
     */
    const electoral = () => {

        markArr = []
        flag = 0
        let range = getDomRange()
        if (range) {
            // 获取起始位置和终止位置
            const start = {
                node: range.startContainer,
                offset: range.startOffset
            }
            const end = {
                node: range.endContainer,
                offset: range.endOffset
            }
            let newNode
            // 2. 处理头尾-----首尾是一个节点的情况,应该是取一个交集
            if (start.node === end.node) {
                newNode = splitNode(start.node, start.offset, end.offset)
                data.push(serialize(newNode))
                parseToDOM(newNode)
            } else {
                // 多节点的情况
                traversalDom(start, end)
                markArr[0] = splitHeader(start)
                markArr[markArr.length - 1] = splitTail(end)
                markArr.forEach(node => data.push(serialize(node)))
                markArr.forEach(node => {
                    parseToDOM(node)
                })
            }
            localStorage.setItem('markDom', JSON.stringify(data))
        }
    }

    /**
     * 
     * @param {*} textNode 
     * @param {*} root 
     * 开始进行DOM的序列化
     * 
     */
    const serialize = (textNode, root = document) => {
        allTextNode = []
        const node = findFatherNode(textNode)
        getAllTextNode(node)
        let childIndexStart = -1
        let childIndexend = -1

        // 计算前置偏移
        const calcLeftLength = (index) => {
            let length = 0
            for (let i = 0; i < index; i++) {
                length = length + allTextNode[i].length
            }
            return length
        }

        let Index = allTextNode.findIndex(textnode => textnode === textNode)
        if (Index === 0) {
            childIndexStart = 0     //前偏移
            childIndexend = calcLeftLength(Index + 1)   //后偏移
        } else if (Index === allTextNode.length - 1) {
            childIndexStart = calcLeftLength(Index)
            childIndexend = calcLeftLength(Index + 1)
        } else {
            childIndexStart = calcLeftLength(Index)
            childIndexend = calcLeftLength(Index + 1)
        }

        // 通过它父亲的节点进行定位就可以😬
        const tagName = node.tagName
        const list = root.getElementsByTagName(tagName)
        for (let index = 0; index < list.length; index++) {
            if (node === list[index]) {
                return { tagName, index, childIndexStart, childIndexend }
            }
        }
        return { tagName, index: -1, childIndexStart, childIndexend }
    }

    /**
     * 
     * @param {*} proNode 
     * 获取全部文本节点，还是dfs
     */
    const getAllTextNode = (proNode) => {
        if (!proNode.childNodes) return
        for (let i = 0; i < proNode.childNodes.length; i++) {
            if (proNode.childNodes[i].nodeType === 3) {
                allTextNode.push(proNode.childNodes[i])
            } else {
                getAllTextNode(proNode.childNodes[i])
            }
        }
    }

    /**
     * 
     * @param {*} meta 
     * @param {*} root 
     * 反序列化
     */
    const deSerialize = (meta, root = document) => {
        const { tagName, index, childIndexStart, childIndexend } = meta
        const parent = root.getElementsByTagName(tagName)[index]
        allTextNode = []
        getAllTextNode(parent)
        let nodeIndexStart = -1
        let nodeIndexEnd = -1
        let length = 0
        let length2 = 0
        let length3 = 0
        for (let i = 0; i < allTextNode.length; i++) {
            length = length + allTextNode[i].length
            if (length >= childIndexStart) {
                nodeIndexStart = i
                break;
            }
        }
        for (let j = 0; j < allTextNode.length; j++) {
            length2 = length2 + allTextNode[j].length
            if (length2 >= childIndexend) {
                nodeIndexEnd = j
                break;
            }
        }

        const calcLeftLength = (index) => {
            let length = 0
            for (let i = 0; i < index; i++) {
                length = length + allTextNode[i].length
            }
            return length
        }

        length3 = calcLeftLength(nodeIndexStart)
        return splitNode(parent.childNodes[nodeIndexStart], childIndexStart - length3, childIndexend - length3)
    }

    /**
     * 
     * @param {*} header
     * 处理头部节点 
     */
    const splitHeader = (header) => {

        header.node.splitText(header.offset)
        return header.node.nextSibling
    }

    /**
     * 
     * @param {*} tail 
     * 处理尾部节点
     */
    const splitTail = (tail) => {
        return tail.node.splitText(tail.offset).previousSibling
    }

    /**
     * 
     * @param {*} node 
     * @param {*} header 
     * @param {*} tail 
     * 首尾在一个节点的情况
     */
    const splitNode = (node, header, tail) => {
        let newNode = node.splitText(header)
        newNode.splitText(tail - header)
        return newNode
    }

    /**
     * 
     * @param {*} node
     * 拿父节点 
     */
    const findFatherNode = (node) => {
        return node.parentNode
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     *  dfs收集
     */
    const collectTextNode = (node, endNode) => {
        // dfs
        if (node.nodeType === 3) {
            pushTextNode(node)
        } else {
            let childNodes = node.childNodes
            if (childNodes) {
                for (let i = 0; i < childNodes.length; i++) {
                    if (childNodes[i].nodeType === 3) {
                        pushTextNode(childNodes[i])
                        if (childNodes[i] == endNode) {
                            flag = 1
                            return
                        }
                    } else {
                        collectTextNode(childNodes[i], endNode)
                    }
                }
            } else {
                return
            }
        }
    }

    /**
     * 
     * @param {*} node
     * mark收集 ，肯定有重复收集的问题
     */
    const pushTextNode = (node) => {
        if (markArr.findIndex(item => node === item) === -1) {
            markArr.push(node)
        }

    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     * 找亲叔叔😀
     */
    const findUncle = (node, endNode) => {
        if (node == markRef.current) {
            return
        }
        let currentNode = node
        let current_fa = findFatherNode(currentNode)
        // 看它老子是不是当前节点的最后一个呢  (╯‵□′)╯炸弹！•••*～●
        if (current_fa.nextSibling) {
            collectTextNode(current_fa.nextSibling, endNode)
            if (flag == 1) {
                return
            } else {
                currentNode = current_fa.nextSibling
                while (currentNode.nextSibling != null && flag === 0) {
                    collectTextNode(currentNode.nextSibling, endNode)
                    currentNode = currentNode.nextSibling
                }
                if (flag == 0) {
                    collectTextNode(currentNode, endNode)
                    findUncle(currentNode, endNode)
                } else {
                    return
                }
            }
        } else {
            collectTextNode(currentNode, endNode)
            findUncle(current_fa, endNode)
        }
    }

    /**
     * 
     * @param {*} start 
     * @param {*} end 
     * dom树遍历
     */
    const traversalDom = (start, end) => {
        let currentNode = start.node
        if (currentNode.nextSibling) {
            while (currentNode != end.node && currentNode.nextSibling != null) {
                collectTextNode(currentNode, end.node)
                currentNode = currentNode.nextSibling
            }
            if (flag == 0) {
                collectTextNode(currentNode, end.node)
                findUncle(currentNode, end.node)
            } else {
                return
            }
        } else {
            collectTextNode(currentNode, end.node)
            findUncle(currentNode, end.node)
        }

    }

    return (
        <div ref={markRef} onMouseUp={electoral}>
            {children}
        </div>
    );
}

export default Mark;