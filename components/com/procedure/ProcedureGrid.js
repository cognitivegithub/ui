Ext.define('Application.components.ProcedureGrid', {
  extend: 'Ext.grid.GridPanel',
  frame: true,
  border: false,
  title: 'Процедуры',
  gridButtons :null,
  limit: 250,
  constructor: function(config) {
    Ext.applyIf(config,{
      plugins: [
        Ext.ux.plugins.Stateful
      ]
    });
    Application.components.ProcedureGrid.superclass.constructor.call(this, config);
  },
  initComponent: function() {
    var component = this;
    var types_combo_id = this.types_combo_id =  Ext.id();
    var procedure_types_combo_id = this.procedure_types_combo_id = Ext.id();
    var search_toolbar_id = this.search_toolbar_id = Ext.id();
    var view_applics_separate = false;
    var statusesCombo = null;
    var statusesFilterMenu = null;

    //switch filters
    this.params = this.switchFilters();
    if(this.customer_id && this.customer_id!=false) {
          this.params.customer_id = parseInt(this.customer_id);
    }
    var store = this.getGridStore(this.params);


      var statuses = [];
    var i;
    statuses.push([-1, 'Все', false]);
    statuses.push([-2, 'Активные', false]);
    statuses.push([-3, 'Ожидающие публикации в ЕИС', false]);
    for (i=0; i<11; i++) {
      var disabled = false;
      if (!isCustomer() && !isAdmin() && i>=0 && i<2 ) {
        disabled = true;
      }
      statuses.push([i, Application.models.Procedure.statuses[i], disabled]);
    }
    
    var statuses_lot = [];
    statuses_lot.push([-1, 'Все', false]);
    for (i=0;i<11; i++) {
      statuses_lot.push([i, Application.models.Lot.statuses[i], false]);
    }
    
    var types = [];
    types.push([0, 'Все']);
    for (i=0; i<Application.models.Procedure.types.length; i++) {
      if (Application.models.Procedure.types[i].id != Application.models.Procedure.type_ids.qualification) {
        if (!Main.config.peretorg_available &&
             (Application.models.Procedure.types[i].id == Application.models.Procedure.type_ids.peretorg_reduc
             || Application.models.Procedure.types[i].id == Application.models.Procedure.type_ids.peretorg_contest)) {
          continue;
        }
        types.push([i+1, Application.models.Procedure.types[i].name]);
      }
    }
    this.statuses_store = new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['id', 'status', 'disabled'],
      idIndex: 0,
      data: statuses
    });
    this.statuses_lot_store = new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['id', 'status', 'disabled'],
      idIndex: 0,
      data: statuses_lot
    });
    this.types_store = new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['id', 'type'],
      idIndex: 0,
      data: types
    });
    this.representatives_store = new Ext.data.DirectStore({
      autoDestroy: true,
      directFn: RPC.Procedure.getRepresentativeList,
      root: 'rows',
      totalProperty: 'totalCount',
      remoteSort: true,
      autoLoad: false,
      fields: ['id', 'full_name'],
      idProperty: 'id'
    });



    this.updateTask = this.getUpdateTask();
/* -->-- alena 3721 определение gridButtons и gridColumns через ф-ции для возможности расширения
    var buttonsType = in_array(this.filter, ['monitoring','representatives'])?  'procedure_'+buttonsType: 'procedure';
    this.gridButtons = new Application.models.GridButtons(this);
    var actions = this.gridButtons.getActions(buttonsType);

    this.gridColumns = new Application.components.ProcedureGridColumns({'actions':actions});
*/
    this.gridButtons = this.getGridButtons();
    this.gridButtons.store = store;
    this.gridColumns = this.getGridColumns(); // --<-- alena 3721
    this.expander =  this.gridColumns.expander;

    // 2014-03-22 dmip
    // Данное изменение вызвано тем, что старое решение не работает в случаях, когда
    // фильтрация осуществляется по нескольким параметрам, а не только по параметру this.filter.
    // Собственно раньше было так:
    //   var filterName = this.filter;
    // Этот вариант приводит к замечательным ошибкам в случае, если фильтрация осуществляется по нескольким
    // параметрам, передаваемым, например, как аргументы в indexAction() или в myAction():
    // 1. Открываем пункт меня вида com/procedure/index/a/1/b/2.
    // 2. Открываем пункт меня вида com/procedure/index/c/3.
    // 3. Видим, что перечень процедур в форме остался от пункта 1.
    // Ошибка проявляется в проектах, построенных на базе cometp.
    // В самом cometp ошибка не воспроизводится, т.к. вся фильтрация является следствием параметра this.filter.
    var filterName = '';
    for(var filterItem in store.baseParams) {
        if (store.baseParams.hasOwnProperty(filterItem)) {
            filterName += filterItem + '-' + store.baseParams[filterItem] + '-';
        }
    }

    this.store = store;

    Ext.apply(this, {
      loadMask: true,
      viewConfig: {
        getRowClass : this.getRowClass.createDelegate(component),
        forceFit: true,
        handleHdDown : function (e, target) {
          if (Ext.fly(target).hasClass('x-grid3-hd-btn')) {
            e.stopEvent();
            var colModel  = this.cm,
            header    = this.findHeaderCell(target),
            index     = this.getCellIndex(header),
            sortable  = colModel.isSortable(index),
            showStsCm = colModel.config[index].showStatusesCombo,
            menu      = this.hmenu,
            menuItems = menu.items,
            menuCls   = this.headerMenuOpenCls;
            this.hdCtxIndex = index;
            Ext.fly(header).addClass(menuCls);
            menuItems.get('asc').setDisabled(!sortable);
            menuItems.get('desc').setDisabled(!sortable);
            menuItems.get('statuses').setVisible(showStsCm);
            menuItems.get('filter_trigger').setVisible(showStsCm);
            if (showStsCm) {
              menuItems.get('statuses').filteredCol = index;
              var subMenuItems = menuItems.get('filter_trigger').menu.items;
              subMenuItems.get('disableColFilterItem').filteredCol = index;
              subMenuItems.get('enabledColFilterItem').filteredCol = index;
            };
            menu.on('hide', function() {
            Ext.fly(header).removeClass(menuCls);
            }, this, {single:true});
            menu.show(target, 'tl-bl?');
          }
        }
      },
      cm: this.gridColumns,
      name: 'procedures-search-'+filterName,
      tbar: this.searchToolbar(),
      bbar: this.getBottomToolbarConfig()
    }); //apply
    this.plugins = this.plugins||[];
    this.plugins.push(this.expander);
    /*

    if (!this.params.customer_id) {
      this.plugins.push(Ext.ux.plugins.Stateful);
    }
    */
    Application.components.ProcedureGrid.superclass.initComponent.call(this);
  },

  getBottomToolbarConfig: function () {
      var component = this;
    return renderPagingToolbar('Процедуры', this.getStore(), this.limit, ['-', {
        xtype: 'button',
        tooltip: 'Скачать текущую выборку как таблицу Excel. ' +
        'Таблица будет включать первые 500 элементов выборки с текущими параметрами фильтрации',
        text: '',
        iconCls: 'icon-silk-disk',
        handler: function(btn) {
            //#PRESS-1064
            $url = '/po/report/downloadProcedures';
            if(btn.ownerCt.store != undefined
                && btn.ownerCt.store != null
                && Main.config.count_excel_report_restriction != undefined
                && Main.config.count_excel_report_restriction != null)
            {
                var advancedSearchToolbar = btn.ownerCt.ownerCt.getTopToolbar();
                if(advancedSearchToolbar != undefined && advancedSearchToolbar!= null)
                {
                    var searchValues = advancedSearchToolbar.getValues();

                    $url += '/advanced_search/true';
                    if (component.filter != 'all') {
                        $url += '/filter/' + component.filter;
                    }

                    if (component.getStore()) {
                        $url += '/sort/' + component.getStore().getSortState().field;
                        $url += '/dir/' + component.getStore().getSortState().direction;
                    }

                    for (i in searchValues.advancedValues)
                    {
                        if(searchValues.advancedValues[i] != null
                            && searchValues.advancedValues[i] != ""
                            && searchValues.advancedValues[i] != false)
                        {
                            $url += '/' + i + '/' + searchValues.advancedValues[i];
                        }
                    }
                }
                if (btn.ownerCt.store.getTotalCount() >= Main.config.count_excel_report_restriction)
                {
                    Ext.Msg.alert('Внимание', 'Попытка выгрузить более ' + Main.config.count_excel_report_restriction + ' записей. Выгрузка невозможна. Уменьшите количество выгружаемых записей установив дополнительные фильтры.');
                }
                else
                {
                    window.open($url);
                }
            }
            else
            {
                window.open($url);
            }
        }
    }], true);
  },

   getGridStore: function (params){
     params.limit = this.limit;
     return  new Application.models.Procedure.getProcedureStore(params);
   },

    getRowClass: function(record){
    var st = false;
    for (var i=0; i<record.data.lots.length; i++) {
        if (false===st) {
            st = record.data.lots[i].status;
        } else if (record.data.lots[i].status != st) {
            return 'x-color-multi';
        }
    }
    return 'x-color-'+(st||0);
  },

  getGridButtons: function(){
    return new Application.models.GridButtons(this);
  },
  getGridColumns: function(){
    var buttonsType = in_array(this.filter, ['monitoring','representatives'])?  'procedure_'+buttonsType: 'procedure';
    var actions = this.gridButtons.getActions(buttonsType,this);
    return new Application.components.ProcedureGridColumns({'actions':actions});
  },
//листенеры компонента
  listeners: {
        afterrender: function() {
          var getMenuItems = this.view.hmenu;
          getMenuItems.add(
              '-',
              {
               itemId:'filter_trigger', 
               text: 'Фильтр (равно)', 
               cls: 'xg-hmenu-filter-trigger', 
               hidden: true,
               hideOnClick: false,
               icon: '/ico/all.png',
               menu: this.statusesFilterMenu
              },
              this.statusesCombo
          );
          
          this.loadMask.show();
          this.store.load.defer(20,this.store);
          Ext.TaskMgr.start(this.updateTask);
          this.getColumnModel().setColumnHeader(
            NO_MAGIC_NUMBER_ZERO,
            '<div title="Сбросить фильтр" class="column-header-reset-trigger"></div>'
          );
        },
        headerclick: function(comp, index) {
          if (index == NO_MAGIC_NUMBER_ZERO) {
            var filteredCol = Ext.getCmp('enabledColFilterItem').filteredCol;
            if (filteredCol) {
              comp.getColumnModel().setColumnHeader(filteredCol, 'Статус');
            }
            this.params.filter_name = null;
            this.params.filter_val = null;
            var filterComponent = Ext.getCmp(this.filterComponent);
            var filterResetButton = Ext.getCmp(this.filterResetButton);
            if (Ext.isObject(filterComponent) && Ext.isObject(filterComponent)) {
              filterResetButton.handler.call(filterComponent);
            }
          }
        },
        destroy: function() {
            Ext.TaskMgr.stop(this.updateTask);
        },
        search: function(query, aq) {
            performStoreSearch(this.store, query, aq);
        },
        rowdblclick: function(grid, row) {
           this.expander.toggleRow(row);
        },
        beforerender: function() {
          var component = this;
          var store = this.store;
          var params = this.params;
          params.filter_name = null;
          params.filter_val = null;
          this.statusesFilterMenu = new Ext.menu.Menu({
            items: [{
              text: 'Отменить фильтр',
              iconCls: '',
              id: 'disableColFilterItem',
              filteredCol: null,
              handler: function() {
                this.setIconClass('x-cols-icon-active-filter');
                Ext.getCmp('enabledColFilterItem').setIconClass('');
                component.getColumnModel().setColumnHeader(this.filteredCol, 'Статус');
                store.load({params : {'filter_name' : null, 'filter_val' : null}});
              }
            }, {
              text: 'Равно',
              iconCls: 'x-cols-icon-active-filter',
              id: 'enabledColFilterItem',
              filteredCol: null,
              handler: function() {
                this.setIconClass('x-cols-icon-active-filter');
                Ext.getCmp('disableColFilterItem').setIconClass('');
                component.getColumnModel().setColumnHeader(this.filteredCol, 'Статус (фильтр)');
                store.load({params : {'filter_name' : params.filter_name, 'filter_val' : params.filter_val}});
              }
            }]
          });

          var procedureStepsStore;
          
          procedureStepsStore = Application.models.Po_Procedure.getStepsStore({withOrderNumber: 1});
          procedureStepsStore.addListener('load', function(storeStep, records, options) {
            Application.models.Po_Procedure.updateFilterStepStore(storeStep);
          }, this, {single: true});
          this.statusesCombo = new Application.components.combo({
            xtype: 'Application.components.combo',
            itemId: 'statuses',
            hidden: true,
            hideLabel: true,
            store: procedureStepsStore,
            valueField: 'pseudo',
            triggerAction: 'all',
            displayField: 'full_name',
            lazyRender: true,
            listClass: 'x-combo-list-small',
            forceSelection: true,
            mode: 'local',
            editable: false,
            allowBlank: true,
            filteredCol: null,
            tooltipTpl: '{full_name}',
            listeners: {
              beforerender: function(combo) {
                combo.setValue(0);
              },
              select: function(combo, record) {
                params.filter_name = 'fake_status';
                params.adv_procedure_step_name = record.get('pseudo');
                store.load({params : {'filter_name' : 'fake_status', 'adv_procedure_step_name' : record.get('pseudo')}});
                component.getColumnModel().setColumnHeader(combo.filteredCol, 'Статус (фильтр)');
              },
              scope: this
            }
          });
        }
    },

  getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
    },
  getExpander : function() {
        if(!this.expander) return false;
        return this.expander;
    },
  showEvents: function(record) {
        var eventWindow = new Ext.Window({
          closeAction: 'close',
          width: 800,
          height: 400,
          layout: 'fit',
          title: 'События по процедуре '+record.data.registry_number,
          items: [
            {
              xtype: 'Application.components.LogGrid',
              procedure_id: record.id,
              procedure_organizer: record.data.organizer_contragent_id,
              logtype: 'procedure',
              height: 369
            }
          ]
        });
        eventWindow.show();
  },
  showProcedureAccess: function(record, lot) {
    var accessWindow = new Ext.Window({
      closeAction: 'close',
      width: 800,
      height: 400,
      layout: 'fit',
      title: 'Журнал доступа к процедуре ' + record.data.registry_number + 'Лот',
      items: [
        {
          xtype: 'Application.components.procedureAccessLogGrid',
          lot_id: record.data.lots[lot].id
        }
      ]
    });
    accessWindow.show();
  },
  showProcedureGrantAccess: function(record) {
      //  var component = this;
        var proc_grant_access_id = Ext.id();
        var eventWindow = new Ext.Window({
          closeAction: 'close',
          width: 800,
          height: 400,
          layout: 'form',
          title: 'Доступ к процедуре '+record.data.registry_number,
          modal: true,
          items: [
            {
              xtype: 'Application.components.GrantAccessGrid',
              proc_id: record.data.id,
              grid_only: true,
              id: proc_grant_access_id,
              autoHeight: true
            }
          ]
          ,
          buttons: [
              {
                  text: 'Сохранить',
                  handler: function(){
                      var tmp_arr = new Array();
                      var arr = new Object();
                      var proc_id = record.data.id;
                      var data_arr = {};
                      var i;
                      data_arr = eventWindow.grid.getStore();
                      for (i = 0; i < data_arr.data.length; i++){
                          arr = {};
                          arr.id = data_arr.data.itemAt(i).data.id;
                          arr.choose = data_arr.data.itemAt(i).data.choose;
                          tmp_arr.push(arr);
                      }
                      var res_arr = {};
                      res_arr.proc_id = proc_id;
                      res_arr.grid_array = tmp_arr;
                      performRPCCall(RPC.User.updateprocuserslist, [res_arr], {wait_text: 'Сохраняем данные...', mask: true}, function(result){
                             if(result.success) {
                               Ext.Msg.alert('Успешно', 'Права доступа успешно сохранены', function() {
                                 eventWindow.close();
                               });
                             } else {
                               echoResponseMessage(result);
                             }
                      });

                  }
              },
              {
                  text: 'Отмена',
                  handler: function(){
                      eventWindow.close();
                  }
              }
          ]
        });
        eventWindow.show();
  },
  showOffers: function(record, lot) {
        var eventWindow = new Ext.Window({
          closeAction: 'close',
          width: 800,
          height: 400,
          layout: 'fit',
          title: 'Ход торгов по процедуре ' + record.data.registry_number + 'Лот',
          items: [
            {
              xtype: 'Application.components.OffersGrid',
              lot_id: record.data.lots[lot].id,
              height: 369
            }
          ]
        });
        eventWindow.show();
  },
  showOOSEvents: function(record) {
        var eventWindow = new Ext.Window({
          closeAction: 'close',
          width: 800,
          height: 400,
          layout: 'fit',
          title: 'Взаимодействие с ЕИС по процедуре '
          + (record.data.registry_number ? record.data.registry_number : ''),
          items: [
            {
              xtype: 'Application.components.OosGrid',
              procedure_id: record.id,
              procedure_organizer: record.data.organizer_contragent_id,
              filter_key: 'procedure_id',
              filter_value: record.id,
              height: 369
            }
          ]
        });
        eventWindow.show();
  },
  showETPEvents: function(record) {
    var customTitle = 'ЕЭТП';
    switch (record.json.etp_pseudo) {
      case ETP_PSEUDO_EETP:
        customTitle = 'ЕЭТП';
        break;
      case ETP_PSEUDO_GPB:
        customTitle = 'ЭТП ГПБ';
        break;
    }
    var eventWindow = new Ext.Window({
      closeAction: 'close',
      width: 800,
      height: 400,
      layout: 'fit',
      title: 'История взаимодействия с ' + customTitle +  ' по процедуре '
      + (record.data.registry_number ? record.data.registry_number : ''),
      items: [
        {
          xtype: 'Application.components.EtpGrid',
          procedure_id: record.id,
          procedure_organizer: record.data.organizer_contragent_id,
          filter_key: 'procedure_id',
          filter_value: record.id,
          etp_place: record.json.etp_place,
          height: 369
        }
      ]
    });
    eventWindow.show();
  },
  showRegnumForm: function(record, grid, is_customer) {
    var winId = Ext.id(), frmId = Ext.id();
    var date_last_edited = parseDate(record.data.date_last_edited);
    if(date_last_edited) {
      date_last_edited = date_last_edited.format('d.m.Y');
    }
    var eventWindow = new Ext.Window({
        closeAction: 'close',
        width: 800,
        height: 200,
        layout: 'fit',
        id: winId,
        title: 'Публикация'+(!Ext.isEmpty(record.data.registry_number) ? (' изменений от '+ date_last_edited) : ''),
        items: [
          {
            xtype: 'form',
            id: frmId,
            height: 169,
            frame: true,
            border: false,
            labelWidth: 250,
            items: [
              {
                xtype: 'textfield',
                style: 'margin-top: 10px',
                name: 'registry_number',
                readOnly: is_customer,
                cls: (is_customer||!Ext.isEmpty(record.data.registry_number)) ? 'readonly': null,
                anchor: '100%',
                value: (!Ext.isEmpty(record.data.registry_number)) ? record.data.registry_number:'',
                fieldLabel: 'Реестровый номер, присвоенный в ЕИС' + REQUIRED_FIELD
              }, {
                fieldLabel: 'Дата публикации процедуры'+REQUIRED_FIELD,
                xtype: 'Application.components.dateField',
                format: 'd.m.Y',
                altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
                anchor: null,
                readOnly: !Ext.isEmpty(record.data.registry_number),
                cls: (is_customer || !Ext.isEmpty(record.data.registry_number)) ? 'readonly': null,
                name: 'date_published',
                width: 200,
                value: record.data.date_published
              }
            ],
            buttons: [
              {
                text: 'Опубликовать',
                handler: function() {
                  var values = Ext.getCmp(frmId).getForm().getValues();
                  values.procedure_id=record.data.id;
                  var confirm='';
                  if(is_customer) {
                    values.is_customer = 1;
                    confirm = 'ВНИМАНИЕ! Данный функционал предназначен для публикации изменений,' +
                      ' не дожидаясь суточной выгрузки информации с zakupki.gov.ru. Функционалом можно' +
                      ' воспользоваться один раз в сутки. Прежде чем опубликовать изменения, убедитесь,' +
                      ' что Проект изменений успешно отправлен на zakupki.gov.ru, что вы его там опубликовали,' +
                      ' и изменения на zakupki.gov.ru уже вступили в силу. Проверить успешность отправки изменений' +
                      ' на zakupki.gov.ru можно в разделе «Операции» - «Взаимодействие с ЕИС» в списке процедур. ' +
                      'Воизбежание расхождения в данных в системе и на сайте zakupki.gov.ru,' +
                      ' Проект изменений должен быть опубликован Вами в ЛК в ЕИС в текущие сутки.' +
                      ' В противном случае функционалом пользоваться нельзя. В случае расхождения данных' +
                      ' Проекта изменений в системе и в ЕИС из-за несвоевременной публикации изменений ' +
                      'в личном кабинете в ЕИС, в ходе суточной выгрузки информации будут приняты данные, '+
                      'поступившие с ЕИС, а неподписанные там изменения будут отменены' +
                      '. Вы уверены, что хотите продолжить публикацию?';
                  } else {
                    confirm = 'Вы действительно хотите опубликовать процедуру,' +
                      ' не дожидаясь подтверждения публикации от ЕИС?';
                  }
                  performRPCCall(RPC.Procedure.forcepublish, [values], {wait_text: 'Идет публикация...',confirm: confirm}, function(result) {
                    if(result.success) {
                      echoResponseMessage(result);
                      grid.getStore().reload();
                      Ext.getCmp(winId).close();
                    } else {
                      echoResponseMessage(result);
                    }
                  });
                }
              }
            ]
          }
        ]
      });
      eventWindow.show();
  },
  searchHelp: function() {
    if (!this.help_search_window) {
      this.help_search_window = new Ext.Window({
        width:750,
        height:350,
        layout: 'fit',
        title: "Справка по поиску",
        closeAction: 'hide',
        bodyStyle: 'padding: 5px;',
        autoScroll: true,
        autoHeight: true,
        plain: true,
        cls: 'x-panel-mc',
        plugins: ['LimitSize'],
        items: [{
          border: false,
          html: '<div>Для более успешного поиска рекомендуем ознакомиться со следующими советами:</div><ul class="bullet-list spaced-list">'+
            '<li>поиск производится с учетом морфологии. Рекомендуется использовать базовые словоформы (например поиск по слову «поставка» найдет и «<i>поставки</i>» и «<i>поставку</i>», но по слову «постав» эти результаты не будут найдены, т.к. это сочетание не является базовой частью слова.);</li>'+
            '<li>различные однокоренные слова могут считаться различными при поиске, например поиск по «дизель» найдет «<i>дизеля</i>», «<i>дизелей</i>». А по «дизельный» найдутся «<i>дизельного</i>», «<i>дизельным</i>», но не наоборот;</li>'+
            '<li>чтобы найти процедуру, в наименовании которой есть сразу несколько искомых слов, достаточно перечислить эти слова через пробел (например поиск по сочетанию «поставка топливо» найдет и «<i>…поставка автомобильного топлива…</i>» и «<i>…на поставку дизельного топлива…</i>» и т.п., причем порядок и расположение слов не важно);</li>'+
            '<li>чтобы найти процедуру, в наименовании которой есть хотя бы одно из искомых слов, достаточно перечислить эти слова через запятую (например поиск по сочетанию «<i>поставка, топливо</i>» найдет и «<i>поставка масла</i>» и «<i>дизельного топлива</i>» и т.п.);</li>'+
            '<li>для исключения из результатов поиска процедур, в наименовании которых есть определенные слова, достаточно указать эти слова в запросе, предварив их восклицательным знаком (например поиск по сочетанию «поставка топливо !бензин» найдет «<i>поставка дизельного топлива</i>», но не найдет «<i>поставка топлива (бензина)</i>»);</li>'+
            '<li>для более сложных запросов можно комбинировать указанные методы, заключая части запросов в скобки (например поиск по сочетанию «(поставка, заправка) (топливо, бензин)» найдет и «<i>поставки бензина</i>», и «<i>заправку автомобильным бензином</i>», и «<i>топливо на поставку</i>» и т.п.);</li>'+
            '<li>знаки препинания при поиске не учитываются, поэтому не следует их указывать в поисковом запросе (за исключением имеющих специальное значение, указанных выше). Предлоги в запросах также не учитываются, и их можно пропускать;</li>'+
            '<li>регистр символов не важен (запросы «БЕНЗИН» и «бензин» идентичны и оба найдут даже «<i>бЕнЗиН</i>»);</li>'+
            '<li>части слов, написанные через дефис, считаются отдельными словами (например поиск по запросу «горючее» найдет «<i>горюче-смазочные</i>»).</li>'+
            '</ul>'+
            '<div>Если поиск не дает никаких результатов, попробуйте заменить слова в запросе на синонимы или использовать иные словоформы. '+
            'Также результаты поиска будут пусты при ошибках в запросе (например при несогласованности скобок).</div>'
        }],
        buttonAlign: 'center',
        buttons: [
          {
            text: 'Закрыть',
            handler: function() {
              this.help_search_window.hide();
            },
            scope: this
          }
        ]
      });
    }
    this.help_search_window.show();
  },
  isAllOf : function(v, m, r) {
        if (this.tooltip=='Поданные заявки'){
            //task-3617
            var isOrganizer = r.data.organizer_contragent_id == Main.contragent.id;
            if (isCustomer() && r.data.procedure_type == PROCEDURE_TYPE_QUOTATION_REQ && isOrganizer && r.json.is_applics_view){
                return false;
            }

            if (Main.user && Main.user.allow_view_apps) {
                return false;
            }
        }
        if (typeof this.isHiddenInLot == 'function'){
            for (var i=0; i<r.data.lots.length; i++) {
              if (!this.isHiddenInLot(r, r.data.lots[i])) {
                return false;
              }
            }
        }
        return true;
    },

  getUpdateTask: function(){
      return {
          interval: 10000,
          scope: this,
          run: function () {
              var store = this.getStore();
              var gridColumns = this.gridColumns;

              if (this.isDestroyed || this.destroying) {
                  Ext.TaskMgr.stop(this.updateTask);
                  return;
              }
              //var view = this.getView();
              var storeupdated = false;
              store.each(function (i) {
                  if (!i.data || !i.data.lots || !i.data.lots.length) {
                      return;
                  }
                  var updated = false;
                  var updatecheck_rows = gridColumns.updatecheck_rows;
                  Ext.each(i.data.lots, function (lot, idx) {
                      for (var d = 0; d < updatecheck_rows.length; d++) {
                          var k = updatecheck_rows[d];
                          var kr = k + '_rendered';
                          if (undefined == lot[kr] || !lot[k]) {
                              continue;
                          }
                          var oldv = lot[kr];
                          var v = gridColumns.dateRenderer(lot[k], null, i, idx, k);
                          if (v != oldv) {
                              updated = true;
                          }
                      }
                  });
                  if (updated) {
                      storeupdated = true;
                      i.beginEdit();
                      i.endEdit();
                  }
              });
              if (storeupdated) {
                  store.fireEvent('datachanged', store);
              }
          }
 }},

  switchFilters: function(){
    var params = {'filter':this.filter};

    switch (this.filter) {
        case 'mine':
            params.organizer_contragent_id = Main.contragent.id;
            break;
        case 'participation':
            params.supplier_id = Main.contragent.id;
            params.has_requests = true;
            params.affiliate_or = 1;
            break;
        case 'contract':
        case 'all_contract':
        case 'performance_contract':
        case 'contract_awaiting_published':
        case 'contract_awaiting_signed':
            params.status = 7;

            if (checkUserRoleExist(SYSTEM_USER_ROLE_FR_UNIT)) {
              params.department_user_id = Main.user.id;
            }
            if (checkUserRoleExist(SYSTEM_USER_ROLE_HEAD_OOZ) || checkUserRoleExist(SYSTEM_USER_ROLE_DEPUTY_HEAD_OOZ)) {
              params.organizer_contragent_id = Main.contragent.id;
              params.affiliate_or = 1;
            }
            if (checkUserRoleExist(SYSTEM_USER_ROLE_PERFOMER_OOZ_UNIT)) {
              params.organizer_contragent_id = Main.contragent.id;
            }
            if (checkUserRoleExist(SYSTEM_USER_ROLE_HEAD_STRUCT_UNIT)) {
              params.organizer_contragent_id = Main.contragent.id;
            }
            if (checkUserRoleExist(SYSTEM_USER_ROLE_PERFOMER_STRUCT_UNIT)) {
              params.organizer_contragent_id = Main.contragent.id;
            }

            break;
        case 'contractcust':
            params.status = 7;
            params.organizer_contragent_id = Main.contragent.id;
            break;
        case 'contractsuppl':
            params.status = 7;
            params.supplier_id = Main.contragent.id;
            break;
        case 'contractarchive':
            if (!isAdmin()) {
                params.organizer_contragent_id = Main.contragent.id;
                params.supplier_id = Main.contragent.id;
                params.affiliate_or = 1;
            }
            params.has_contract = 1;
            break;
        case 'contractarchivecust':
            params.organizer_contragent_id = Main.contragent.id;
            params.has_contract = 1;
            break;
        case 'contractarchivesuppl':
            params.supplier_id = Main.contragent.id;
            params.has_contract = 1;
            break;
        case 'favourite':
            params.favourite=Main.user.id;
            break;
        case 'archive':
        case 'contractarchiveprev':
        case 'contractarchivelast':
        case 'contractarchivecurrent':
            params.status = 8;
            break;
        case 'auctionsdown':
            params.procedure_type = PROCEDURE_TYPE_AUC_DESC;
            break;
        case 'auctionsup':
            params.procedure_type = PROCEDURE_TYPE_AUC_ASC;
            break;
        case 'contest':
            params.procedure_type = PROCEDURE_TYPE_TENDER;
            break;
        case 'quotation':
            params.procedure_type = PROCEDURE_TYPE_QUOTATION_REQ;
            break;
        case 'pricelist':
            params.procedure_type = PROCEDURE_TYPE_PRICELIST_REQ;
            break;
        case 'qualification':
            params.procedure_type = PROCEDURE_TYPE_QUALIFICATION;
            break;
        case 'auctions':
            params.procedure_type = [1,2];
            break;
        case 'monitoring':
            params.monitoring_procedures = 1;
            break;
        case 'representatives':
            params.representative=true;
            break;
    }

    return params;
  },

  searchToolbar: function(){
      var params = this.params;
 return  {
     xtype: 'Application.components.searchToolbar',
     id: this.search_toolbar_id,
     searchTools: [{
         id: 'help',
         align: 'left',
         handler: this.searchHelp,
         tip: 'Справка по поиску',
         scope: this
     }],
     eventTarget: this,
     /*state_id: 'procedure_grid_search_query_'+this.filter,
      //advancedSearchActive: true,
      advancedSearchDefaults: {
      statePrefix: 'procedure_grid_search',
      stateSuffix: this.filter
      },*/
     advancedSearch: [{
         xtype: 'textfield',
         name: 'oos_id',
         fieldLabel: 'Номер ЕИС'
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'dateinterval',
         name: 'date_end_registration',
         width: 150,
         fieldLabel: 'Окончание приема заявок'
         //,plugins: [Ext.ux.plugins.Stateful]
     },{
         xtype: 'combo',
         id: this.procedure_types_combo_id,
         editable: false,
         mode: 'local',
         fieldLabel: 'Тип процедур',
         triggerAction: 'all',
         name: 'procedure_type',
         displayField: 'type',
         valueField: 'id',
         store: this.types_store,
         value: 0,
         //plugins: [Ext.ux.plugins.Stateful],
         listeners: {
             scope:this,
             select: function(combo, record, index) {
                 var stat_combo = Ext.getCmp(this.types_combo_id);
                 var type = Application.models.Procedure.getType(record.data.id);
                 var value = stat_combo.getValue();
                 this.statuses_store.each(function(r){
                     r.beginEdit();
                     if (type && type.customStatusNames && type.customStatusNames[r.data.id]) {
                         r.data.status = type.customStatusNames[r.data.id];
                     } else if (0 <= r.data.id) {
                         r.data.status = Application.models.Procedure.statuses[r.data.id];
                     }
                     r.data.disabled = false;
                     if ( (!isCustomer() && !isAdmin() && r.data.id>=0 && r.data.id<2)||
                         (r.data.id>=0 && type && type.statuses && type.statuses.indexOf(r.data.id)<0)
                         )
                     {
                         r.data.disabled = true;
                     }
                     r.endEdit();
                 });
                 this.statuses_store.fireEvent('datachanged', this.statuses_store);
                 if (this.statuses_store.getById(value).data.disabled) {
                     value = -1;
                 }
                 stat_combo.setValue(value);
                 //stat_combo.view.refresh();
             }
         }
     }, {
         xtype: 'Application.components.priceinterval',
         intervalType: 'Field',
         name: 'start_price',
         width: 150,
         fieldLabel: 'Начальная цена',
         allowNegative: false,
         fromText: 'от',
         tillText: 'до'
         //,plugins: [Ext.ux.plugins.Stateful]
     },{
         xtype: 'checkbox',
         name: 'peretorg_possible',
         fieldLabel: 'Флаг возможности переторжки'
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'dateinterval',
         name: 'date_begin_auction',
         width: 150,
         fieldLabel: 'Проведение торгов'
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.combo',
         //id: this.types_combo_id,
         editable: false,
         width: 200,
         mode: 'local',
         fieldLabel: 'Статус лота',
         name: 'status_lot',
         triggerAction: 'all',
         displayField: 'status',
         disabledField: 'disabled',
         valueField: 'id',
         value: -1,
         store: this.statuses_lot_store
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.percentinterval',
         intervalType: 'Field',
         name: 'guarantee_application',
         width: 150,
         fieldLabel: 'Размер обеспечения заявки по лоту',
         //allowNegative: false,
         fromText: 'от',
         tillText: 'до'
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.combo',
         id: this.types_combo_id,
         editable: false,
         width: 200,
         mode: 'local',
         fieldLabel: 'Статус процедур',
         name: 'status',
         triggerAction: 'all',
         displayField: 'status',
         disabledField: 'disabled',
         valueField: 'id',
         value: -1,
         store: this.statuses_store
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'dateinterval',
         name: 'date_published',
         width: 150,
         fieldLabel: 'Дата публикации процедуры'
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'textfield',
         name: 'organizer',
         fieldLabel: 'Организатор',
         hidden: (!isSupplier() && isCustomer())
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.numberinterval',
         intervalType: 'Field',
         name: 'counts_application_by_lot',
         width: 150,
         fieldLabel: 'Количество заявок по лоту',
         allowNegative: false,
         fromText: 'от',
         tillText: 'до'
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.combo',
         editable: false,
         width: 200,
         mode: 'local',
         fieldLabel: 'Регион организатора',
         name: 'organizer_region',
         triggerAction: 'all',
         displayField: 'name',
         valueField: 'name',
         value: 'Все',
         store: createRegionsStore()
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'checkbox',
         name: 'coordination_resolved',
         boxLabel: 'Согласованные закупки',
         fieldLabel: '',
         labelSeparator: '',
         hidden: !Main.config.procedure_coordination || (Main && Main.user && Main.user.department_role_id != DEPARTMENT_ROLE_HEAD),
         disabled: !Main.config.procedure_coordination || (Main && Main.user && Main.user.department_role_id != DEPARTMENT_ROLE_HEAD)
     }, {
         xtype: 'textfield',
         name: 'customer',
         fieldLabel: 'Заказчик'
         //,hidden: !isCustomerSpecorg() || !Main.config.customers_search_for_specorg
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'numberfield',
         name: 'currency',
         fieldLabel: 'Валюта ' + t('контракта'),
         emptyText: 810
     }, {
         xtype: 'textfield',
         name: 'customer_inn',
         fieldLabel: 'ИНН заказчика лота'
         //,hidden: !isCustomerSpecorg() || !Main.config.customers_search_for_specorg
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.priceinterval',
         intervalType: 'Field',
         name: '',
         width: 150,
         fieldLabel: 'Категории упрощенного классификатора',
         allowNegative: false,
         fromText: 'код',
         tillText: 'код',
         hidden: true
         //,plugins: [Ext.ux.plugins.Stateful]
     }, {
         xtype: 'Application.components.combo',
         editable: false,
         width: 200,
         mode: 'local',
         name: 'customer_region',
         fieldLabel: 'Регион заказчика лота',
         triggerAction: 'all',
         displayField: 'name',
         valueField: 'name',
         value: 'Все',
         store: createRegionsStore()
     }, {
         xtype: 'combo',
         name: 'department_id',
         valueField: 'id',
         displayField: 'name',
         fieldLabel: 'Отдел',
         mode: 'local',
         store: createDepartmentsStore({isActual: true, limit: false}),
         editable: false,
         triggerAction: 'all',
         hidden: !Main.config.departments || (Main && Main.user && Main.user.department_role_id != DEPARTMENT_ROLE_HEAD),
         listeners: {
             render: function() {
                 if (Main.config.departments && Main && Main.user && Main.user.department_role_id == DEPARTMENT_ROLE_HEAD) {
                     var store = this.getStore();
                     store.load();
                 }
             }
         }
     }, {
         xtype: 'combo',
         editable: false,
         fieldLabel: 'Представитель',
         mode: 'local',
         name: 'representatives_combo_box',
         triggerAction: 'all',
         displayField: 'full_name',
         valueField: 'id',
         store: this.representatives_store,
         hidden: !this.params.representative || !isCustomer(),
         stateful: true,
         listeners: {
             scope:this,
             afterrender: function() {
                 if (!(!this.params.representative || !isCustomer())) {
                     var combo = this;
                     var store = this.getStore();
                     store.load({callback:function(){
                         var value = combo.getValue();
                         if (!value) {
                             var recordSelected = combo.getStore().getAt(0);
                             value = recordSelected.get('id');
                         }
                         combo.setValue(value);
                     }});
                 }
             }
         }
     }],
     listeners: {
         scope:this,
         afterrender: function() {
             var procedure_types_combo = Ext.getCmp(this.procedure_types_combo_id);
             var stat_combo = Ext.getCmp(this.types_combo_id);
             if (this.params.procedure_type) {
                 procedure_types_combo.setVisible(false);
                 procedure_types_combo.setDisabled(true);
             }
             if (this.params.status) {
                 stat_combo.setVisible(false);
                 stat_combo.setDisabled(true);
             }
         }
     }
 };
},
    showProcedureGrantAccess: function(record) {
        //  var component = this;
        var proc_grant_access_id = Ext.id();
        var eventWindow = new Ext.Window({
            closeAction: 'close',
            width: 800,
            height: 400,
            layout: 'form',
            title: 'Доступ к процедуре '+record.data.registry_number,
            modal: true,
            items: [
                {
                    xtype: 'Application.components.GrantAccessGrid',
                    proc_id: record.data.id,
                    grid_only: true,
                    id: proc_grant_access_id,
                    autoHeight: true
                }
            ]
            ,
            buttons: [
                {
                    text: 'Сохранить',
                    handler: function(){
                        var tmp_arr = new Array();
                        var arr = new Object();
                        var proc_id = record.data.id;
                        //eventWindow.close();
//                      var proc_grant_access = Ext.getCmp(proc_grant_access_id);
//                      var cmp_values = {};
                        //cmp_values = proc_grant_access.getStore();
                        //collectComponentValues(proc_grant_access, cmp_values);
                        var data_arr = {};
                        var i;
                        data_arr = eventWindow.grid.getStore();
                        for (i = 0; i < data_arr.data.length; i++){
                            arr = {};
                            arr.id = data_arr.data.itemAt(i).data.id;
                            arr.choose = data_arr.data.itemAt(i).data.choose;
                            tmp_arr.push(arr);
                        }
                        var res_arr = {};
                        res_arr.proc_id = proc_id;
                        res_arr.grid_array = tmp_arr;
                        performRPCCall(RPC.User.updateprocuserslist, [res_arr], {wait_text: 'Сохраняем данные...', mask: true}, function(result){
                            if(result.success) {
                                Ext.Msg.alert('Успешно', 'Права доступа успешно сохранены', function() {
                                    eventWindow.close();
                                });
                            } else {
                                echoResponseMessage(result);
                            }
                        });

                    }
                },
                {
                    text: 'Отмена',
                    handler: function(){
                        eventWindow.close();
                    }
                }
            ]
        });
        eventWindow.show();
    }
});
