
Ext.define('Application.components.procedureAccessLogGrid', {
  extend: 'Ext.grid.Panel',
  lot_id: null,
  initComponent: function() {
    this.access_store = new Ext.data.DirectStore({
      autoLoad: true,
      autoDestroy: true,
      directFn: RPC.Procedure.accessLog,
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      baseParams: {
        lot_id: this.lot_id
      },
      idProperty: 'id',
      totalProperty: 'totalCount',
      paramsAsHash: true,
      remoteSort: true,
      root: 'log',
      fields: ['id', 'filename', 'registry_number', 'user_ip', 'inn',
        {name: 'full_name', convert: function(v){
          return v||'Гость';
        }},
        {name: 'title', convert: function(v, r){
          if (r.lot_document_id) {
            return 'Скачивание документа'+(r.filename?(' <a href="/file/get/t/LotDocuments/id/'+r.lot_document_id+'">'+r.filename.escapeHtml()+'</a>'):'');
          }
          return 'Просмотр извещения';
        }},
        {name: 'date', convert: function(v){return parseDate(v);}}
      ],
      listeners: {
        exception: storeExceptionHandler
      }
    });
    var columns = [{header: 'Идентификатор', dataIndex: 'id', hidden: true, sortable: true, width: 20},
      {header: 'Дата', dataIndex: 'date', renderer: Ext.util.Format.dateRenderer(this.lot_id?'d.m.Y H:i':'d.m.Y H:i:s'), hidden: false, sortable: true, width: 40},
      {header: 'Организация', dataIndex: 'full_name', hidden: false, sortable: false},
      {header: 'Действие', dataIndex: 'title', hidden: false, sortable: false, width: 60}
    ];
    if (!this.lot_id && isAdmin()) {
      columns.splice(2, 0,
        {header: 'Процедура', dataIndex: 'registry_number', sortable: true, width: 40},
        {header: 'ИНН', dataIndex: 'inn', sortable: false, width: 40}
      );
      columns.push({header: 'ИП', dataIndex: 'user_ip', sortable: true, width: 40})
      this.tbar = {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        advancedSearch: [{
          xtype: 'textfield',
          name: 'registry_number',
          fieldLabel: 'Процедура'
        }, {
          xtype: 'dateinterval',
          name: 'date',
          format: 'd.m.Y H:i:s',
          fieldLabel: 'Дата события',
          tillAlign: 'date',
          width: 150
        }, {
          xtype: 'textfield',
          name: 'inn',
          fieldLabel: 'ИНН организации'
        }, {
          xtype: 'textfield',
          name: 'user_ip',
          fieldLabel: 'ИП'
        }]
      };
    }
    Ext.apply(this, {
      store: this.access_store,
      loadMask: true,
      columns: columns,
      viewConfig: {
        forceFit: true
      },
      bbar: renderPagingToolbar('Записи', this.access_store, this.lot_id?25:100)
    });

    this.listeners = this.listeners||{};
    Ext.apply(this.listeners, {
      search: function(query, aq) {
        aq = aq||{};
        aq.query = query;
        if (aq) {
          for (var sp in aq) {
            if (!aq.hasOwnProperty(sp)) {
              continue;
            }
            this.access_store.setBaseParam(sp, aq[sp]);
          }
        }
        this.access_store.load();
      },
      scope: this
    });
    Application.components.procedureAccessLogGrid.superclass.initComponent.call(this);
  }
});
