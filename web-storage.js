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

    ready: function() {

      function Cache( name ) {
        var db = new PouchDB( name );
        this.add = function( key, value ) {
          db.put(value, key, function(err, res) {
            if( err ) {
              console.log( err );
            } else {
              console.log( res );
            }
          } );
        };
        this.del = function( key ) {

        };
        this.get = function( key, success, failure ) {
          db.get( key, function( err, doc ) {
            if ( err ) {
              failure();
            } else {
              success( doc );
            }
          } );
        };
      }

      this.storage = new Cache( this.group.replace( / /, '_' ) + '_' +
                                this.resource.replace( / /, '_' ) );

      this.fire('storage-ready', { storage : this.storage });

      /*
        var evt_manager = leighcourt_events();

        leighcourt_database( {
          window   : window,
          group    : self.group,
          resource : self.resource,
          events   : evt_manager
        } );

        console.log( "Create Storage ... " );
        console.log( self.resource );

        (function (emr) {
            emr.on('storageLoaded', 'storageReady');
            emr.fire('storageLoad');
            emr.on('storageReady', function (storage) {

                console.log( "Storage Loaded ..." );
                console.log( storage );

                self.storage = storage;
                self.fire('storage-ready', {'storage':storage});
            });
        })(evt_manager);
      */
    }
});
