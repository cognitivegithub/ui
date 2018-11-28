
 Ext.define('Application.components.SoapLogGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    this.addEvents('search');

    var ttbar = {
      xtype: 'Application.components.searchToolbar',
      eventTarget: this,
      searchHelp: 'Быстрый поиск по сообщениям',
      advancedSearch: [{
        xtype: 'textfield',
        name: 'procedure_registry_number',
        fieldLabel: 'Реестровый номер процедуры'
      }, {
        xtype: 'dateinterval',
        name: 'date_sent',
        format: 'd-m-Y H:i:s',
        width: 150,
        tillAlign: 'date',
        fieldLabel: 'Прием/отправка'
      }, {
        xtype: 'textfield',
        name: 'guid',
        fieldLabel: 'ID сообщения'
      }]
    };

    var store = new Ext.data.DirectStore(
    {
      directFn: RPC.Log.indexSoap,
      paramsAsHash: true,
      root: 'entries',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: [
        'id', 'message_id', 'response_to', 'direction', 'action', 'registry_number', 'procedure_id',
        {name: 'date_created', type: 'date', dateFormat: 'c'},
        {name: 'date_sent', type: 'date', dateFormat: 'c'},
        {name: 'date_confirmed', type: 'date', dateFormat: 'c'},
        'errors_count'
      ],
      sortInfo: {
        field: 'date_created',
        direction: 'DESC'
      },
      remoteSort: true
    });

    function directionRenderer(v) {
      var fmt = '<img src="/ico/{0}.png" />';
      if ('out'==v) {
        return String.format(fmt, 'up');
      } else if ('in'==v) {
        return String.format(fmt, 'down');
      }
      return '?';
    }

    function procedureRenderer(v, m, r) {
      if (v) {
        return v;
      } else if (r && r.data && r.data.procedure_id) {
        return '<span ext:qtip="Процедура не опубликована, реестровый номер не присвоен">н/п '+r.data.procedure_id+'</span>';
      }
      return '';
    }

    function errorsRenderer(v) {
      if (v) {
        var txt = v + ' ошибок';
        return '<img src="/ico/errors.png" alt="'+txt+'" ext:qtip="'+txt+'" />';
      }
      return '';
    }

    function opsRenderer(v, m, r) {
      var fmt = '<a href="/log/soapGet/t/{0}/id/{1}/name/{0}_{1}.xml">{2}</a>';
      var links = [String.format(fmt, 'request', v, 'Запрос')];
      if (r.data.date_confirmed || 'in'==r.data.direction) {
        links.push(String.format(fmt, 'response', v, 'Ответ'));
      }
      return links.join(' ');
    }

    var daterenderer =  Ext.util.Format.dateRenderer('d.m.Y H:i:s');
    Ext.apply(this,
    {
      store: store,
      columns: [
        {header: 'ID события', width: 40, dataIndex: 'id', sortable: true, hidden: true},
        {header: 'Направление передачи', width: 5, dataIndex: 'direction', renderer:directionRenderer},
        {header: 'Процедура', width: 20, dataIndex: 'registry_number', renderer: procedureRenderer},
        {header: 'ID сообщения', width: 40, dataIndex: 'message_id'},
        {header: 'ID изначального сообщения', width: 40, dataIndex: 'response_to', hidden: true},
        {header: 'Дата и время создания', width: 20, dataIndex: 'date_created', renderer: daterenderer, sortable: true, hidden: true},
        {header: 'Дата и время приема/отправки', width: 20, dataIndex: 'date_sent', renderer: daterenderer, sortable: true},
        {header: 'Дата и время подтверждения', width: 20, dataIndex: 'date_confirmed', renderer: daterenderer, sortable: true},
        {header: 'Действие', width: 30, dataIndex: 'action'},
        {header: 'Ошибок', width: 5, dataIndex: 'errors_count', renderer: errorsRenderer},
        {header: 'Операции', width: 20, dataIndex: 'id', renderer: opsRenderer}
      ],
      viewConfig: {
        forceFit: true
      },
      tbar: ttbar,
      bbar: renderPagingToolbar('Записи', store, 50, ['-', renderStoreDownloadButton(store, '/log/indexSoap')], true),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('query', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          store.load();
        }
      }
    }
    );

    Application.components.SoapLogGrid.superclass.initComponent.call(this);
  }
});
