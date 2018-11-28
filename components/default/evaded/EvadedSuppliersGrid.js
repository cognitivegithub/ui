/**
 * Компонент выводит грид уклонистов
 *
 */
Application.components.EvadedSuppliersGrid = Ext.extend(Ext.grid.GridPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createEvadedSuppliersStore(this.type);
    Ext.apply(this,
    {
      store: store,
        columns: [
          {id: 'id', dataIndex: 'id', hidden: true},
          {id: 'lot_id', dataIndex: 'lot_id', hidden: true},
          {id: 'procedure_id', dataIndex: 'procedure_id', hidden: true},
          {id: 'show_links', dataIndex: 'show_links', hidden: true},
          {id: 'blocks_count', dataIndex: 'blocks_count', hidden: true},
          {
            xtype: 'textactioncolumn',
            header: 'Организация',
            dataIndex: 'full_name',
            width: 300
            ,
            items: [{
              text: function(value, metaData, record) {
                return record.data.full_name;
              },
              href: function(value, metaData, record) {
                return href_to('company/view/id/' + record.data.supplier_id);
              }
            }]
          },
          {header: 'Заказчик', dataIndex: 'customer', width: 300},
          {header: 'Реестровый номер', dataIndex: 'registry_number', width: 100},
          {header: 'Лот', dataIndex: 'subject', width: 100},
          {
            xtype: 'textactioncolumn',
            header: 'Обеспечение',
            dataIndex: 'guarantee',
            width: 100,
            renderer: function(value, metaData, record) {
              return record.data.blocks_count == 0 ? 'разблокировано' : 'заблокировано';
            }
          }, {
            header: 'Направлено заказчику',
            dataIndex: 'customer_fee',
            width: 100,
            renderer: function(value, metaData, record) {
              return record.data.customer_fee ? record.data.customer_fee : 'не направлено';
            }
          }, {
            xtype: 'textactioncolumn',
            header: 'Операции',
            width: 90,
            dataIndex: 'id',
            sortable: false,
            items: [
              {
                isHidden: function(value, metaData, record) { 
                  return true;//record.data.show_links == "1";
                },
                text: "Направить обеспечение",
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  this.fireEvent("collectGuarantee", record.id, record.lot_id, record.show_links);return false;
                }
              },
              {
                text: "Разблокировать",
                isHidden: function(value, metaData, record) {
                  return record.data.blocks_count == "0";
                },
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  var win = new Application.components.promptWindow({
                    title: 'Разблокирование средств и признание заявителя не уклонистом',
                    cmpType: 'Application.components.PromptForm',
                    cmpParams: {
                      api: RPC.Company.unsetAvoidance,
                      items: [
                        {
                          xtype: 'hidden',
                          name: 'procedure_id',
                          value: record.data.procedure_id
                        },
                        {
                          xtype: 'hidden',
                          name: 'lot_id',
                          value: record.data.lot_id
                        },
                        {
                          xtype: 'hidden',
                          name: 'supplier_id',
                          value: record.data.id
                        }
                      ]
                    },
                    listeners: {
                      afterrender : function() {
                        Ext.getCmp('signature_text').setValue('Средства по процедуре '+ record.data.registry_number +' разблокированы. Заявитель не является уклонистом.');
                      }
                    }
                  });
                  win.show();
                }
              }

            ],
            scope: this
          }
        ],
      viewConfig: {
        forceFit: true
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по организации',
        advancedSearch: [{
          xtype: 'textfield',
          name: 'contragent_name',
          fieldLabel: 'Наименование'
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      bbar: renderPagingToolbar('Организации', store),
      listeners: {
        collectGuarantee : function(id, lot_id) {
          redirect_to(String.format('company/collectGuarantee/id/{0}/lot_id/{1}', id, lot_id));
        },
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
          store.setBaseParam('type', this.type);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          store.load();
        }
      }
    }
    );
    Application.components.EvadedSuppliersGrid.superclass.initComponent.call(this);
  }
});
