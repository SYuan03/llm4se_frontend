

import { defineStore } from "pinia";

export const useMessageStore = defineStore({
    id: 'message',
    state: () => ({
        message: { text: 'message1', isUser: false, isGraphic: false },
        conversations: [
            { id: '用例图', messages: [] },
            { id: '概念类图', messages: [] },
            { id: '系统顺序图', messages: [] },
            { id: '状态图', messages: [] },
            { id: '需求规格说明文档', messages: [] },
            { id: '用例分析文档', messages: [] }
        ],
        loadings: [{ id: '用例图', loading: false },
        { id: '概念类图', loading: false },
        { id: '系统顺序图', loading: false },
        { id: '状态图', loading: false },
        { id: '需求规格说明文档', loading: false },
        { id: '用例分析文档', loading: false }],
        suggestions: [{ id: '用例图', suggestion: [] },
        { id: '概念类图', suggestion: [] },
        { id: '系统顺序图', suggestion: [] },
        { id: '状态图', suggestion: [] },
        { id: '需求规格说明文档', suggestion: [] },
        { id: '用例分析文档', suggestion: [] }
        ],
        checkpoints: [{ id: '用例图', checkpoint: '' },
        { id: '概念类图', checkpoint: '' },
        { id: '系统顺序图', checkpoint: '' },
        { id: '状态图', checkpoint: '' },
        ],
        currentConversationId: '用例图',
        currentConversation: [],
    }),
    actions: {
        setCurrentConversationId(id) {
            this.currentConversationId = id;
        },
        getCurrentConversationId() {
            return this.currentConversationId;
        },
        setCurrentConversation(id) {
            this.currentConversation = this.getConversationMessages(id);
        },
        getCurrentConversation() {
            return this.currentConversation;
        },
        isMessagesEmpty(conversationId) {
            const conversation = this.conversations.find(c => c.id === conversationId);
            return conversation.messages.length === 0 ? true : false;
        },
        addMessage(conversationId, message) {
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.messages.push(message);
            } else {
                this.conversations.push({ id: conversationId, messages: [message] });
            }
        },
        getConversationMessages(conversationId) {
            const conversation = this.conversations.find(c => c.id === conversationId);
            return conversation ? conversation.messages : {};
        },
        getSuggestions(conversationId) {
            const suggestion = this.suggestions.find(c => c.id === conversationId);
            return suggestion ? suggestion.suggestion : [];
        },
        setSuggestions(conversationId, suggestions) {
            const suggestion = this.suggestions.find(c => c.id === conversationId);
            if (suggestion) {
                suggestion.suggestion = suggestions;
            } else {
                this.suggestions.push({ id: conversationId, suggestion: suggestions });
            }
        }
    }

});