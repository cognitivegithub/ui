/**
 * Компонент выводит грид запросов на разъяснение положений АД.
 * Параметры:
 * proc_id - если задан, то выводятся запросы только по этой процедуре,
 * если же не задан - то все вообще.
 */
Ext.define('Application.components.RequestGrid', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  initComponent: function() {
    var component = this;
    var baseParams = {};
    var store_fields = ['id', {name: 'date_added', type: 'date', dateFormat: 'c'}, {name: 'date_forwarded', type: 'date', dateFormat: 'c'},
      'status_id', 'status_name', 'lot_id', 'number', 'lot_title', 'lot_status', 'registry_number', 'procedure_id', 'proc_title',
      'request_message', 'organizer_contragent_id', {name: 'date_solved', type: 'date', dateFormat: 'c'},
      'organizer_department_id',
      {name: 'date_cancelled', type: 'date', dateFormat: 'c'}];
    if (!component.application_action) {
      component.application_action = '';
    } else {
      store_fields.push('application_id');
    }

    var showSupplierNameField = (component.showrequest_action == 'showrequestapplic' && isCustomer());
    if (showSupplierNameField) {
      store_fields.push('supplier_name');
    }

    if (component.lot) baseParams = {lot_id: component.lot};

    if (component.optype && (component.optype == 'allrequest' || component.optype == 'request' || component.optype == 'response' || component.optype == 'rejected')) {
      Ext.apply(baseParams, {request_status: component.optype});
    }

    if (component.parent.procedure) {
        Ext.apply(baseParams, {proc_id: component.parent.procedure});
    }
   if (component.parent.supplier) {
          Ext.apply(baseParams, {supplier_id: component.parent.supplier});
    }

    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      directFn: component.store_fn,
      totalProperty: 'totalCount',
      root: 'rows',
      sortInfo: {
        field: 'date_added',
        direction: 'DESC'
      },
      remoteSort: true,
      autoLoad: false,
      baseParams: baseParams,
      fields: store_fields
    });
    Ext.apply(this, {
      loadMask: true,
      store: store,
      viewConfig: {
        forceFit: true
      },
      columns: [
        {header: 'Реестровый №', dataIndex: 'registry_number', width: 30, sortable: true},
        {header: 'ID процедуры', dataIndex: 'procedure_id', width: 30, sortable: true},
        {header: 'Дата направления', dataIndex: 'date_added', sortable: true, width: 30, renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')},
        {header: 'Дата и время ответа', dataIndex: 'date_solved', hidden: (component.optype != 'response'), sortable: true, width: 30, renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')},
        {header: 'Дата и время отклонения', dataIndex: 'date_cancelled', hidden: (component.optype != 'rejected'), sortable: true, width: 30, renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')},
        {header: "Наименование процедуры", dataIndex: 'proc_title', sortable: true},

        // {header: "Наименование участника", dataIndex: 'supplier_name', hidden: !showSupplierNameField, sortable: true},
        {header: "Статус", dataIndex: 'status_name', sortable: true, width: 30,
          renderer: function(val){
            if (val=='В ожидании разъяснения') {
              return val='<span style="color:red">' + val + '</span>'
            }
            return val;
          }
        },
        {header: "Краткое содержание запроса", dataIndex: 'request_message', sortable: false},
        {header: "Операции", dataIndex: 'extra', sortable: false, width: 30, xtype: 'textactioncolumn', actionsSeparator: ' ',
          items:[                {
            tooltip: 'Информация',
            icon: '/ico/about.png',
            pseudo: 'about',
            isHidden: function (v, m, record) {
              return false;
            },
            handler: function (grid, rowIndex) {
              var id = grid.getStore().getAt(rowIndex).data.procedure_id;

              performRPCCall(RPC.Procedure.info, [id], null, function(resp) {
                var win = new Application.components.ProcedureStepInfo({data: resp});
                win.show();
              });
            }
          }, {
            tooltip: 'Направить ИЗ',
            icon: '/ico/accept.png',
            isShown: function(v, m, r) {
              if (!isUserPerfomerOOZUnit()) {
                return false;
              }
              return (r.data.status_id == 2);
            },
            handler: redirectActionHandler('com/procedure/' + component.showrequest_action + '/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          },{
            tooltip: 'Направить на согласование руководителю',
            icon: '/ico/accept.png',
            isShown: function(v, m, r) {
              if (!isUserPerfomerStructUnit()
              || r.data.organizer_department_id !=  Main.user.department_id
              ) {
                return false;
              }
              return (r.data.status_id == REQUEST_STATUS_EDIT_IZ);
            },
            handler: redirectActionHandler('com/procedure/' + component.showrequest_action + '/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          },{
            tooltip:'Направить на согласование ГД/ФР или на корректировку ООЗ',
            icon: '/ico/accept.png',
            isShown: function(v, m, r) {
              if ((!isUserHeadStructUnit()
                || r.data.organizer_department_id !=  Main.user.department_id)
                && (!(isUserHeadOOZ() && r.data.organizer_department_id ==  Main.user.department_id))
              ) {
                return false;
              }
              return (r.data.status_id == REQUEST_EDIT_RIZ);
            },
            handler: redirectActionHandler('com/procedure/' + component.showrequest_action + '/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          },
          {
            tooltip: 'Утвердить',
            icon: '/ico/accept.png',
            isShown: function(v, m, r) {
              if (!isGendir() && !isFR()) {
                return false;
              }
              return (r.data.status_id == REQUEST_EDIT_GD);
            },
            handler: redirectActionHandler('com/procedure/' + component.showrequest_action + '/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          },
          {
            tooltip: 'Текст запроса',
            icon: '/ico/settings/browse.png',
            isShown: function() {
              return true;
            },
            handler: redirectActionHandler(
              'com/procedure/'
              + component.showrequest_action
              + '/view/1/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'
              + component.application_action
            )
          }, {
            tooltip: 'Текст запроса и причина его отклонения',
            icon: '/ico/settings/browse.png',
            isShown: function(v, m, r) {
              return (r.data.status_id == 4);
            },
            handler: redirectActionHandler('com/procedure/' + component.showrequest_action + '/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          }, {
            tooltip: 'Опубликовать разъяснение',
            icon: '/ico/settings/change_data.png',
            isShown: function(v, m, r) {
              if (!checkUserDepartment(DEPARTMENT_OOZ)) {
                return false;
              }
              if (!component.application_action) {
                return (
                  isCustomer()
                  && (r.data.status_id == 2 || r.data.status_id == REQUEST_EDIT_OOZ)
                  && Main.user.contragent_id == r.data.organizer_contragent_id
                  && r.data.lot_status < 7
                );
              } else {
                return (
                  isSupplier()
                  && (r.data.status_id == 2 || r.data.status_id == REQUEST_EDIT_OOZ)
                  && Main.user.contragent_id != r.data.organizer_contragent_id
                  && r.data.lot_status < 7
                );
              }
            },
            handler: redirectActionHandler('com/procedure/' + component.request_action + '/type/response/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          }, {
            tooltip: 'Отклонить запрос',
            icon: '/ico/delete.png',
            isShown: function(v, m, r) {
              if (!checkUserDepartment(DEPARTMENT_OOZ)) {
                return false;
              }
              if (!component.application_action) {
                return (
                  isCustomer()
                  && (r.data.status_id == 2 || r.data.status_id == REQUEST_EDIT_OOZ)
                  && Main.user.contragent_id == r.data.organizer_contragent_id
                );
              } else {
                return (
                  isSupplier()
                  && (r.data.status_id == 2 || r.data.status_id == REQUEST_EDIT_OOZ)
                  && Main.user.contragent_id != r.data.organizer_contragent_id
                );
              }
            },
            handler: redirectActionHandler('com/procedure/' + component.request_action + '/type/cancel/procedure/{procedure_id}/lot/{lot_id}/reqid/{id}'+component.application_action)
          }]
        }
       ],
      tbar: {
        xtype: 'Application.components.searchToolbar',
        searchHelp: 'Номер процедуры',
        eventTarget: this,
        advancedSearchDefaults: {
          statePrefix: 'request_grid_search',
          stateSuffix: this.filter
        },
        advancedSearch: [
          {
            xtype: 'checkbox',
            name: 'archive_lots',
            labelWidth: 400,
            boxLabel: '',
            fieldLabel: 'Показывать архивные процедуры',
            labelSeparator: ':'
          }
        ]
      },
      bbar: renderPagingToolbar('Запросы', store),
      listeners: {
        render: function() {
          store.load();
        },
        search: function(query, aq) {
          if (query) {
            query = query.toLowerCase();
          }
          aq = aq||{};
          aq.registry_number = query;
          if (aq) {
            for (var sp in aq) {
              store.setBaseParam(sp, aq[sp]);
            }
          }
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    });
    Application.components.RequestGrid.superclass.initComponent.call(this);
  }
});
