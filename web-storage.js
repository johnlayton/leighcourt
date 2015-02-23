'use strict';
Polymer('web-storage', {

    /**
     * Fired when underlying storage (websql or indexeddb) is ready
     *
     * @event storage-ready
     * @type CustomEvent
     * @param {storage} storage The storage api
     */

    /**
     * reference to the storage api, either web sql or indexeddb
     * Sets up the api and data structure for offline tiles
     *
     * @property storage
     * @type Object
     * @default undefined
     */
    storage: undefined,

    domReady: function() {
/*
        console.log( "Dom Ready ....");
        console.log( this.group );
        console.log( this.resource );
*/
    },

    ready: function() {
/*
        console.log( "Ready ....");
        console.log( this.group );
        console.log( this.resource );
*/
        this.onReady();
    },

    created: function() {
/*
        console.log( "Created ....");
        console.log( this.group );
        console.log( this.resource );
*/
    },

    onReady: function() {
        var self = this;
        var evt_manager = leighcourt_events();
        leighcourt_database( {
          window   : window,
          group    : self.group,
          resource : self.resource,
          events   : evt_manager
        } );

        (function (emr) {
            emr.on('storageLoaded', 'storageReady');
            emr.fire('storageLoad');
            emr.on('storageReady', function (storage) {
                self.storage = storage;
                self.fire('storage-ready', {'storage':storage});
            });
        })(evt_manager);

    }
});
