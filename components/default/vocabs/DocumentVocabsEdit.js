
Ext.define('Application.components.documentVocabsEdit', {
  extend: 'Ext.grid.Panel',
  editable: true,
  frame: true,
  border: false,
  initComponent: function() {
    var component = this;

    var store, columns;

    var vocabTypes = [[1, 'Основание требования'], [2, 'Наименование документа']];
    var typeEditor = new Ext.form.ComboBox({
      editable: false,
      store: vocabTypes,
      allowBlank: false,
      triggerAction: 'all',
      mode: 'local'
    });

    var typeRenderer = function (v) {
        for (var i = 0; i < vocabTypes.length; i++) {
            if (vocabTypes[i][0] == v) {
                return vocabTypes[i][1];
            }
        }
        return v;
    };

    store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: true,
      api: {
        read    : RPC.Reference.docvocabsAdminIndex,
        create  : RPC.Reference.docvocabsUpdate,
        update  : RPC.Reference.docvocabsUpdate,
        destroy : RPC.Reference.docvocabsDelete
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : false}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'vocabs',
      fields: ['id', 'type', 'vocab']
    });

    columns = [
        {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true},
        {header: 'Тип', dataIndex: 'type', width: 40, sortable: true, editor: typeEditor, renderer: typeRenderer},
        {header: 'Текст', dataIndex: 'vocab', sortable: true, editor: Ext.ux.helpers.textEdit(), flex: 1},
        {header: 'Операции', xtype: 'textactioncolumn', width: 20,
         items: [{
           icon: '/ico/delete.png',
           tooltip: 'Удалить',
           handler: function(grid, rowIndex) {
             grid.getStore().removeAt(rowIndex);
           }
         }]
        }
    ];

    Ext.apply(this, {
      loadMask: true,
      hideTitle: false,
      store: store,
      viewConfig: {
        forceFit: true
      },
      columns: columns,
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        items: [{
          text: 'Добавить текст',
          iconCls: 'icon-silk-add',
          handler: function(){
            var record = new store.recordType({
              id: null
            });
            store.insert(0, record);
            component.startEditing(0,1);
          }
        }, {
          xtype: 'tbspacer', width: 50
        }]
      },
      bbar: [{
        cls:'x-btn-text-icon',
        icon: 'ico/database_save.png',
        text: 'Сохранить',
        handler: function(){
          store.save();
        }
      }, {
        cls:'x-btn-text-icon',
        icon: 'ico/undo.png',
        text: 'Отменить',
        handler: function(){
          rejectStoreChanges(store);
        }
      }, '->', {
        iconCls: 'x-tbar-loading',
        handler: function() {
          store.reload();
        }
      }],
      listeners: {
        search: function(query) {
          if (!query || ''==query) {
            store.clearFilter();
          } else {
            query = query.toLowerCase();
            store.filterBy(function(record){
              return record.data.vocab.toLowerCase().indexOf(query)>=0;
            });
          }
        }
      }
    });
    Application.components.documentVocabsEdit.superclass.initComponent.call(this);
  }
});
