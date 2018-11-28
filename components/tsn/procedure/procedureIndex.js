Ext.define('Application.components.procedureIndex', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  initComponent: function() {
    var types_combo_id = Ext.id();
    var procedure_types_combo_id = Ext.id();
    var params = {};

    switch (this.filter) {
      case 'mine':
        params.organizer_contragent_id = Main.contragent.id;
        break;
      case 'participation':
        params.supplier_id = Main.contragent.id;
        params.has_requests = true;
        params.affiliate_or = 1;
        break;
      case 'favourite':
        params.favourite=Main.user.id;
        break;
      case 'archive':
        params.status = 8;
        break;
      case 'fixprice':
        params.procedure_type = Application.models.Tsn_Procedure.type_ids.fix_price;
        break;
      case 'auction':
        params.procedure_type = Application.models.Tsn_Procedure.type_ids.auction;
        break;
    }

    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      directFn: RPC_tsn.Procedure.index,
      totalProperty: 'totalCount',
      root: 'procedures',
      remoteSort: true,
      autoLoad: false,
      idProperty: 'id',
      fields: ['id', 'registry_number', 'procedure_type', 'lot_unit_name', 'title', 'organizer_contragent_id', 'full_name', 'status',
               {name: 'current_price', type: 'float', defaultValue: 0}, 'currency_name', 'currency_description', 'date_published',
               'date_next_offer', 'available_quantity', 'offers_number', 'picture_thumb', 'picture_preview', 'okei_abbr'
              ],
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      baseParams: params
    });
    var statuses = [];
    var i;
    statuses.push([-1, 'Все', false]);
    for (i=0; i<Application.models.Tsn_Procedure.statuses.length; i++) {
      var disabled = false;
      if ((!Main.contragent || !Main.contragent.customer_accreditations || !Main.contragent.customer_accreditations.length) && i>=0&&i<2 ) {
        disabled = true;
      }
      statuses.push([i, Application.models.Tsn_Procedure.statuses[i], disabled]);
    }
    var types = [];
    types.push([0, 'Все']);
    for (i=0; i<Application.models.Tsn_Procedure.types.length; i++) {
        types.push([i+1, Application.models.Tsn_Procedure.types[i].name]);
    }
    var statuses_store = new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['id', 'status', 'disabled'],
      idIndex: 0,
      data: statuses
    });
    var types_store = new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['id', 'type'],
      idIndex: 0,
      data: types
    });

    var region_store = getRegionStore();
    region_store.load({start: 0, limit: 100});

    var nomenclature_store = getNomenclatureStore();
    nomenclature_store.load();

    var currencyRenderer = function(value, meta, record) {
      var c = false;
      if (!value) {
        return '—';
      }
      if (record.data.currency_name) {
        c = record.data.currency_name;
        if (record.data.currency_description) {
          c = '<span ext:qtip="'+record.data.currency_description+'">'+c+'</span>';
        }
      }
      var format = Ext.apply(Ext.util.Format.numberFormat, {
        hideNullDecimal: true
      });
      return Ext.util.Format.formatPrice(value, format) + (c?(' '+c):'');
    };

    var quantityRenderer = function(value, meta, record) {
      var c = false;
      if (!value) {
        return '—';
      }
      if (record.data.okei_abbr) {
        c = record.data.okei_abbr;
      }
      var format = Ext.apply(Ext.util.Format.numberFormat, {
        hideNullDecimal: true
      });
      return Ext.util.Format.formatPrice(value, format) + (c?(' '+c):'');
    };

    function statusRenderer(v, m, r) {
      v = v||1;
      var t = Application.models.Tsn_Procedure.getType(r.data.procedure_type);
      if (t && t.customStatusNames && t.customStatusNames[v]) {
        return t.customStatusNames[v];
      }
      return v?Application.models.Tsn_Procedure.statuses[v]:'';
    }

    function dateRenderer(v) {
      v = parseDate(v);
      if (!v) {
        return '—';
      }
      return Ext.util.Format.date(v, 'd.m.Y H:i');
    }

    var actions;
    actions = [{
      tooltip: 'Редактировать',
      icon: '/ico/lot/lot_edit.png',
      isHidden: function(v, m, r) {
        var val = r.data.status;
        return (!isCustomer()) || (r.data.organizer_contragent_id != Main.contragent.id) || val > 2;
      },
      handler: redirectActionHandler('tsn/procedure/edit/id/{id}')
    }, {
      tooltip: 'Просмотреть описание лота',
      icon: '/ico/lot/lot_view.png',
      isHidden: function(v, m, r) {
        return r.data.status<2;
      },
      handler: redirectActionHandler('tsn/procedure/view/procedure/{id}')
    }, {
      tooltip: 'Добавить в избранное',
      icon: '/ico/lot/lot_favourize.png',
      isHidden: (params.favourite || isAdmin())?true:false,
      handler: function(grid, rowIndex) {
        var item = grid.getAt(rowIndex);
        var params = {};
        params.procedure_id = item.id;
        performRPCCall(RPC_tsn.Procedure.favourize, [params],null, function(result){
          echoResponseMessage(result);
        });
      }
    }, {
      tooltip: 'Удалить из избранного',
      icon: '/ico/procedures/delete_procedure.png',
      isHidden: (!params.favourite||isAdmin())?true:false,
      handler: function(grid, rowIndex) {
        var item = grid.getAt(rowIndex);
        var params = {};
        params.procedure_id = item.id;
        performRPCCall(RPC_tsn.Procedure.unfavourize, [params],null, function(result){
          store.reload();
          echoResponseMessage(result);
        });
      }
    }, {
      tooltip: 'Подписать',
      icon: '/ico/applics/sign_applic.png',
      isHidden: function(v, m, r) {
        return !isCustomer() || r.data.status>1;
      },
      handler: redirectActionHandler('tsn/procedure/sign/id/{id}')
    }, {
      tooltip: 'Подать предложение',
      icon: '/ico/lot/lot_apply.png',
      isHidden: function(v, m, r) {
        var suppl = isSupplier();
        return (!suppl || Main.contragent.id==r.data.organizer_contragent_id || r.data.status!=2);
      },
      handler: redirectActionHandler('tsn/applic/create/procedure/{id}')
    }, {
      tooltip: 'Торги',
      icon: '/ico/status3.png',
      isHidden: function(v, m, r) {
        return 5!=r.data.status;
      },
      handler: redirectActionHandler('tsn/procedure/trade/procedure/{procedure_id}')
    }, {
      tooltip: 'События',
      icon: '/ico/procedures/genstat.png',
      isHidden: function(v, m, r) {
        if (r.data.status<=2) {
          return true;
        }
        return false;
      },
      scope: this,
      handler: function(grid, rowIndex){this.showEvents(grid.getAt(rowIndex));}
    }, {
      tooltip: 'Договоры',
      icon: '/ico/contracts/contracts.png',
      isHidden: function(v, m, r) {
        return (!Main.config.contracts_on || r.data.status < 7 || r.data.procedure_type == 4 || r.data.procedure_type == 5);
      },
      handler: redirectActionHandler('tsn/contract/index/procedure/{procedure_id}')
    }, {
      tooltop: 'Удалить',
      icon: '/ico/lot/lot_delete.png',
      isHidden: function(v, m, r) {
        var val = r.data.status;

        if (isCustomer()) {
          return (Main.contragent.id!=r.data.organizer_contragent_id || val>1);
        }
        return !isAdmin();
      },
      handler: function(grid, rowIndex) {
        var confirm = new Ext.Template('Вы действительно хотите удалить лот «{title}»?');
        var item = grid.getAt(rowIndex);
        if (item) {
          item = item.data;
          var params = {
            mask: true,
            wait_text: 'Удаляется лот',
            confirm: confirm.apply(item)
          };
          performRPCCall(RPC_tsn.Procedure['delete'], [item.id], params, function(resp) {
            echoResponseMessage(resp);
            if (resp.success) {
              store.reload();
            }
          });
        }
      }
    }, {
      tooltip: 'Отказаться от проведения торгов',
      icon: '/ico/stop.png',
      isHidden: function(v, m, r) {
        var val = r.data.status;
        if (isCustomer()) {
          return (Main.contragent.id!=r.data.organizer_contragent_id || val>4 );
        }
        return true;
      },
      handler: redirectActionHandler('tsn/procedure/cancel/id/{id}')
    }, {
      tooltip: 'Приостановить',
      icon: '/ico/pause.png',
      isHidden: function(v, m, r) {
        if (!isAdmin()) return true;
        return (r.data.status == 8 || r.data.status == 9 && r.data.status != 10);
      },
      handler: function(grid, rowIndex, colIndex, gitem, e, lot) {
        var data, location, confirm;
        var item = grid.getAt(rowIndex);
        if (!item || !item.data ) {
          return;
        }

        location = 'tsn/procedure/pause/procedure/{procedure_id}';
        confirm = 'Вы действительно хотите приостановить лот';
        data = {procedure_id: item.data.id}

        var template = new Ext.Template(location);
        var dst = template.apply(data);
        Ext.Msg.confirm('Подтверждение', confirm, function(r) {
          if ('yes'==r) {
            redirect_to(dst);
          }
        });
      }
    }, {
      tooltip: 'Возобновить',
      icon: '/ico/play.png',
      isHidden: function(v, m, r) {
        if (!Main.user.has_role_admin) return true;
        return r.data.status != 9;
      },
      handler: redirectActionHandler('tsn/procedure/resume/procedure/{procedure_id}')
    }];

    var expander = new Ext.ux.grid.RowExpander({
      createExpandingRowPanelItems: function(grid, store, record, rowIndex) {
        var items = [];
        var d, l, link, title;
        var expander_template = new Ext.XTemplate(
           '<table width="100%" cellspacing="0" cellpadding="0" border="0" class="cleanbackground"><tr>'+
             '<td width="60" style="text-indent: 10px;">Лот</td>' +
             '<td>{subject}</td>'+
             '<td width="150">{price}</td>'+
             '<td width="150">{status}</td>'+
             '<td width="100">{actions}</td>'+
           '</tr></table>');
        for (var lot_n=0; lot_n<record.data.lots.length; lot_n++) {
          l = record.data.lots[lot_n];
          d = Ext.apply({}, l);
          d.actions = [];

          d.status = statusRenderer(l.status, null, record);
          d.price = currencyRenrerer(l.start_price, null, record);
          d.actionHandlers = [];
          d.actionIds = [];
          d.actions = [];
          for (var j=0; j<actions.length; j++) {
            if (!actions[j].lotDepends || actions[j].isHiddenInLot(record, l)) {
              continue;
            }
            d.actionHandlers.push(actions[j]);
            var act_id = Ext.id();
            d.actionIds.push(act_id);
            d.actions.push('<a href="javascript:;"><img src="'+actions[j].icon+'" ext:qtip="'+actions[j].tooltip+'" id="'+act_id+'"/></a>');
          }
          d.actions = d.actions.join(' ');
          (function(l, lot) {
            items.push({
              xtype: 'panel',
              border: false,
              frame: false,
              //anchor: '100%',
              autoHeight: true,
              //monitorResize: true,
              cls: 'grid-lot-item x-color-'+l.status,
              bodyCssClass: 'spaced-panel cleanbackground',
              html: expander_template.apply(d),
              data: d,
              listeners: {
                afterrender: function(cmp) {
                  for (var i=0; i<cmp.data.actionHandlers.length; i++) {
                    Ext.get(cmp.data.actionIds[i]).on('click', (function(action){ return function(){
                      action.handler(grid, rowIndex, 0, null, null, lot);
                    }})(cmp.data.actionHandlers[i]));
                  }
                }
              }
            });
        })(l, lot_n);
        }
        return items;
      },
      hideable: false,
      hideExpander: function(record) {
        return !record.data.lots.length;
      }
    });

    var tts = new Ext.ux.grid.CellToolTips([
      {
          field: 'picture_thumb',
          tipConfig: {
            width: 412,
            autoHide: false
          },
          tpl:'{picture_preview}'
      }
    ]);

    Ext.apply(this, {
      loadMask: true,
      plugins: [tts],
      store: store,
      viewConfig: {
        getRowClass : function(record){
          var st = record.data.status;
          return 'x-color-'+(st||0);
        },
        forceFit: true
      },
      columns: [
                {header: 'Идентификатор', dataIndex: 'id', width: 20, sortable: true, hidden: true},
                {header: 'Реестровый №', dataIndex: 'registry_number', width: 70, sortable: true},
                {header: 'Тип', dataIndex: 'procedure_type', width: 20, sortable: true,
                   renderer: function(v){
                     var t = Application.models.Tsn_Procedure.getType(v);
                     var images = {
                       '1': '/ico/auction.png',
                       '2': '/ico/cart.png'
                     };
                     var name = t?t.name:'';
                     return '<img src="'+(images[''+v]?images[''+v]:'/ico/auction.png')+
                            '" ext:qtip="'+name+'" alt="'+name+'" />';
                   }},
                {header: 'Организатор', dataIndex: 'full_name', width: 60, sortable: true},
                {header: 'Наименование', dataIndex: 'title', width: 140, sortable: true},
                {header: 'Фото', dataIndex: 'picture_thumb', sortable: false},
                {header: 'Кол-во', dataIndex: 'available_quantity', width: 40, sortable: true, renderer: quantityRenderer},
                {header: 'Цена (стартовая цена)', dataIndex: 'current_price', width: 60, sortable: true, renderer: currencyRenderer},
                {header: 'Дата публикации', width: 60, sortable: true, dataIndex: 'date_published', renderer: dateRenderer},
                {header: 'Подано предложений', dataIndex: 'offers_number', width: 40, hidden: true, sortable: true},
                {header: 'Предполагаемая дата окончания подачи предложений', width: 100, hidden: true, sortable: false, renderer: dateRenderer, dataIndex: 'date_next_offer'},
                {header: 'Статус', width: 60, sortable: true, dataIndex: 'status', renderer: statusRenderer},
                {header: 'Операции', xtype: 'textactioncolumn', width: 80, actionsSeparator: ' ',
                  items: actions
                }
               ],
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        advancedSearchActive: true,
        advancedSearch: [{
          xtype: 'combo',
          id: procedure_types_combo_id,
          editable: false,
          mode: 'local',
          fieldLabel: 'Категория товара',
          triggerAction: 'all',
          name: 'nomenclature',
          displayField: 'text',
          valueField: 'id',
          store: nomenclature_store
        }, {
          xtype: 'dateinterval',
          name: 'date_published',
          width: 150,
          fieldLabel: 'Дата публикации'
        }, {
          xtype: 'Application.components.combo',
          id: types_combo_id,
          editable: false,
          width: 200,
          mode: 'local',
          fieldLabel: 'Регион',
          name: 'region',
          triggerAction: 'all',
          displayField: 'name',
          valueField: 'id',
          store: region_store
        }, {
          xtype: 'numberinterval',
          name: 'start_price',
          width: 150,
          fieldLabel: 'Начальная цена',
          allowNegative: false,
          fromText: 'от',
          tillText: 'до'
        }, {
          xtype: 'textfield',
          name: 'keywords',
          fieldLabel: 'Ключевые слова',
          qtipConfig: {
            html:'<ul class="tooltip-text spaced-list">'+
                '<li>поиск производится с учетом морфологии. Рекомендуется использовать базовые словоформы '+
                  '(например поиск по слову «поставка» найдет и «<i>поставки</i>» и «<i>поставку</i>», но по слову «постав» эти результаты не будут '+
                  'найдены, т.к. это сочетание не является базовой частью слова.);</li>'+
                '<li>различные однокоренные слова могут считаться различными при поиске, например поиск по «дизель» найдет «<i>дизеля</i>», «<i>дизелей</i>». А по «дизельный» найдутся «<i>дизельного</i>», '+
                '«<i>дизельным</i>», но не наоборот;</li>'+
                '<li>чтобы найти лот, в наименовании которого есть несколько искомых слов, достаточно перечислить эти слова через пробел (например поиск по сочетанию «поставка топливо» найдет и «<i>…поставка автомобильного топлива…</i>» и «<i>…на поставку дизельного топлива…</i>» и т.п., причем порядок и расположение слов не важно);</li>'+
                '<li>чтобы найти лот, в наименовании которого есть хотя бы одно из искомых слов, достаточно перечислить эти слова через запятую (например поиск по сочетанию «<i>поставка, топливо</i>» найдет и «<i>поставка масла</i>» и «<i>дизельного топлива</i>» и т.п.);</li>'+
                '<li>для исключения из результатов поиска лотов, в наименовании которых есть определенные слова, достаточно указать эти слова в запросе, предварив их восклицательным знаком (например поиск по сочетанию «поставка топливо !бензин» найдет «<i>поставка дизельного топлива</i>», но не найдет «<i>поставка топлива (бензина)</i>»);</li>'+
                '<li>для более сложных запросов можно комбинировать указанные методы, заключая части запросов в скобки (например поиск по сочетанию «(поставка, заправка) (топливо, бензин)» найдет и «<i>поставки бензина</i>», и «<i>заправку автомобильным бензином</i>», и «<i>топливо на поставку</i>» и т.п.);</li>'+
                '<li>знаки препинания при поиске не учитываются, поэтому не следует их указывать в поисковом запросе (за исключением имеющих специальное значение, указанных выше). Предлоги в запросах также не учитываются, и их можно пропускать;</li>'+
                '<li>регистр символов не важен (запросы «БЕНЗИН» и «бензин» идентичны и оба найдут даже «<i>бЕнЗиН</i>»);</li>'+
                '<li>части слов, написанные через дефис, считаются отдельными словами (например поиск по запросу «горючее» найдет «<i>горюче-смазочные</i>»).</li>'+
                '</ul><div class="tooltip-text">Если поиск не дает никаких результатов, попробуйте заменить слова в запросе на синонимы или использовать иные словоформы. Также результаты поиска будут пусты при ошибках в запросе (например при несогласованности скобок).</div>',
            title: 'Для более успешного поиска рекомендуем ознакомиться со следующими советами:',
            applyTipTo: 'label',
            width: 350,
            autoHide: false
          },
          plugins: [Ext.ux.plugins.ToolTip]
        }, {
          xtype: 'textfield',
          name: 'organizer',
          fieldLabel: 'Продавец'
        }, {
          xtype: 'checkbox',
          boxLabel: 'только с фотографией',
          hideLabel: true,
          name: 'photo_only'
        }],
        listeners: {
          afterrender: function() {
            var procedure_types_combo = Ext.getCmp(procedure_types_combo_id);
            var stat_combo = Ext.getCmp(types_combo_id);
            if (store.baseParams.procedure_type) {
              procedure_types_combo.setVisible(false);
              procedure_types_combo.setDisabled(true);
            }
            if (store.baseParams.status) {
              stat_combo.setVisible(false);
              stat_combo.setDisabled(true);
            }
          }
        }
      },
      bbar: renderPagingToolbar('Лоты', store, 25, [], true),
      listeners: {
        render: function() {
          store.load();
        },
        search: function(query, aq) {
          if (query) {
            query = query.toLowerCase();
          }
          aq = aq||{};
          aq.query = query;
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
    Application.components.procedureIndex.superclass.initComponent.call(this);
  },
  showEvents: function(record) {
    var eventWindow = new Ext.Window({
      closeAction: 'hide',
      width: 800,
      height: 400,
      title: 'События по лоту '+record.data.registry_number,
      items: [
        {
          xtype: 'Application.components.LogGrid',
          procedure_id: record.id,
          procedure_organizer: record.data.organizer_contragent_id,
          logtype: 'main',
          height: 369
        }
      ]
    });
    eventWindow.show();
  }
});
