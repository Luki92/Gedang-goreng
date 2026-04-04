/**
 * @typedef {Object} PortalContent
 * @property {any} content
 * @property {string} type
 */

class PortalStore {
    /** @type {Map<string, PortalContent>} */
    portals = $state(new Map());

    /**
     * @param {string} id
     * @param {any} content
     * @param {string} [type]
     */
    register(id, content, type = 'html') {
        this.portals.set(id, { content, type });
    }

    /** @param {string} id */
    unregister(id) {
        this.portals.delete(id);
    }

    clear() {
        this.portals.clear();
    }
}

export const portalStore = new PortalStore();
