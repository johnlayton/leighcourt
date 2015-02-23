(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    leighcourt_database = factory();
  }
}( this, function () {

  var LeighcourtDatabase = ( function () {

    var LeighcourtDatabase = function ( options ) {
      this.options = options;

      var window = options.window;
      var emr = options.events;

      var getIndexedDBStorage = function () {
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        var IndexedDBImpl = function () {
          var self = this;
          var db = null;
          var request = indexedDB.open(options.group);

          request.onsuccess = function() {
            db = this.result;
            emr.fire('storageLoaded', self);
          };

          request.onerror = function (error) {
            console.log(error);
          };

          request.onupgradeneeded = function () {
            var store = this.result.createObjectStore(options.resource, { keyPath: 'key'});
            store.createIndex('key', 'key', { unique: true });
          };

          this.add = function (key, value) {
            //console.log('adding tile');
            var transaction = db.transaction([options.resource], 'readwrite');
            var objectStore = transaction.objectStore(options.resource);
            objectStore.put({key: key, value: value});
          };

          this.delete = function (key) {
            //console.log('delete tile');
            var transaction = db.transaction([options.resource], 'readwrite');
            var objectStore = transaction.objectStore(options.resource);
            objectStore.delete(key);
          };

          this.get = function (key, successCallback, errorCallback) {
            var transaction = db.transaction([options.resource], 'readonly');
            var objectStore = transaction.objectStore(options.resource);
            var result = objectStore.get(key);
            result.onsuccess = function () {
              successCallback(this.result ? this.result.value : undefined);
            };
            result.onerror = errorCallback;
          };
        };

        return indexedDB ? new IndexedDBImpl() : null;
      };

      var getWebSqlStorage = function () {
        var openDatabase = window.openDatabase;

        var WebSqlImpl = function () {
          var self = this;
          var db = openDatabase(options.group, '1.0', options.group + ' Storage', 5 * 1024 * 1024);
          db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + options.resource + ' (key TEXT PRIMARY KEY, value TEXT)', [], function () {
              emr.fire('storageLoaded', self);
            });
          });

          this.add = function (key, value) {
            db.transaction(function (tx) {
              tx.executeSql('INSERT INTO ' + options.resource + ' (key, value) VALUES (?, ?)', [key, value]);
            });
          };

          this.delete = function (key) {
            db.transaction(function (tx) {
              tx.executeSql('DELETE FROM ' + options.resource + ' WHERE key = ?', [key]);
            });
          };

          this.get = function (key, successCallback, errorCallback) {
            db.transaction(function (tx) {
              tx.executeSql('SELECT value FROM ' + options.resource + ' WHERE key = ?', [key], function (tx, result) {
                successCallback(result.rows.length ? result.rows.item(0).value : undefined);
              }, errorCallback);
            });
          };
        };

        return openDatabase ? new WebSqlImpl() : null;
      };

      emr.on('storageLoad', function () {
        var storage =  getIndexedDBStorage() || getWebSqlStorage() || null;
        if (!storage) {
          emr.fire('storageLoaded', null);
        }
      });
    };

    return LeighcourtDatabase;
  } )();

  return function ( options ) {
    return new LeighcourtDatabase( options );
  };

} ));
