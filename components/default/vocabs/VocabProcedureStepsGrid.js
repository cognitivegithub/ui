/**
 * Грид для операций над шагами процедур
 */
Ext.define('Application.components.VocabProcedureStepsGrid', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  initComponent: function() {
    var store = createVocabProcedureStepsStore();

    var step_dates = [];
//    for(var prop in Application.models.Procedure.step_dates) {
//      if (Application.models.Procedure.step_dates.hasOwnProperty(prop)
//            && Application.models.Procedure.step_dates[prop].pseudo) {
//        step_dates.push([Application.models.Procedure.step_dates[prop].pseudo]);
//      }
//    }
    for(var prop in Main.config.procedure_steps) {
      if (Main.config.procedure_steps.hasOwnProperty(prop)
            && Main.config.procedure_steps[prop].date_field_name) {
        step_dates.push([Main.config.procedure_steps[prop].date_field_name]);
      }
    }

    var getWindow = function(data) {
      var winId = Ext.id();
      return new Ext.Window({
        title: (!data ? 'Добавление' : 'Редактирование'),
        width: 850,
        plain: true,
        id: winId,
        items: [{
          xtype: 'fieldset',
          title: 'Данные шага',
          style: 'margin: 7px 10px 10px;',
          defaults: {
            anchor: '100%',
            labelWidth: 200,
            labelSeparator: ''
          },
          items: [{
            xtype: 'hidden',
            name: 'id'
          }, {
            xtype: 'textfield',
            fieldLabel: 'Псевдо',
            name: 'pseudo'
          }, {
            xtype: 'textfield',
            fieldLabel: 'Название шага',
            name: 'full_name'
          }, {
            xtype: 'checkbox',
            boxLabel: 'Актуально',
            name: 'actual'
          }, {
            xtype: 'checkbox',
            boxLabel: 'Является субпроцедурой',
            name: 'is_subprocedure'
          }, {
            xtype: 'combo',
            name: 'status',
            fieldLabel: 'Статус',
            mode: 'local',
            store : new Ext.data.ArrayStore({
              id: 0,
              fields: ['id', 'name'],
              data: [
                [null, 'Не определен'],
                [1, 'Не опубликован'],
                [2, 'Прием заявок'],
                [3, 'Вскрытие конвертов'],
                [4, 'Рассмотрение заявок'],
                [5, 'Торги'],
                [6, 'Подведение итогов']
              ]
            }),
            editable: false,
            valueField: 'id',
            displayField: 'name',
            hiddenName : 'name',
            triggerAction: 'all'
          }, {
            xtype: 'combo',
            name: 'date_field_name',
            fieldLabel: 'Поле даты',
            mode: 'local',
            store : new Ext.data.ArrayStore({
              id: 0,
              fields: ['date_field_name'],
              data: step_dates
            }),
            editable: false,
            valueField: 'date_field_name',
            displayField: 'date_field_name',
            hiddenName : 'date_field_name',
            triggerAction: 'all'
          }, {
            xtype: 'checkbox',
            boxLabel: 'Требуется указание времени',
            name: 'time_required'
          }, {
            fieldLabel: 'Допущенные типы процедур',
            xtype: 'superboxselect',
            store: new Ext.data.ArrayStore({
              id: 0,
              fields: ['id', 'name'],
              data: [
                ['1', 'Аукцион на повышение'],
                ['2', 'Редукцион'],
                ['3', 'Конкурс'],
                ['4', 'Запрос предложений'],
                ['5', 'Запрос котировок'],
                ['6', 'Квалификационный отбор'],
                ['7', 'Очная переторжка'],
                ['8', 'Заочная переторжка'],
                ['9', 'Простая закупка'],
                ['10', 'Малая закупка'],
                ['11', 'Аукцион'],
                ['12', 'Конкурентные переговоры']
              ]
            }),
            displayField: 'name',
            valueField: 'id',
            editable: false,
            triggerAction: 'all',
            anchor: '100%',
            forceSelection: true,
            value: '',
            mode: 'local',
            emptyText: '',
            name: 'allowed_procedure_types'
          }]
        }],
        buttons: [{
          text: (!data ? 'Добавить' : 'Сохранить'),
          scope: this,
          handler: function() {
            var vals = {};
            var cmp = Ext.getCmp(winId);
            collectComponentValues(cmp, vals);
            performRPCCall(RPC.Admin.editvocabprocedurestep, [vals], {wait_text: 'Идет сохранение...'}, function(result) {
              if(result.success) {
                store.reload();
                Ext.getCmp(winId).close();
              } else {
                echoResponseMessage(result);
              }
            });
          }
        }, {
          text: 'Отмена',
          scope: this,
          handler: function() {
            Ext.getCmp(winId).close();
          }
        }],
        listeners: {
          afterrender: function() {
            if (data) {
              setComponentValues(this, data);
            }
          }
        }
      });
    }

    Ext.apply(this, {
      store: store,
      loadMask: {msg: 'Загрузка шагов...'},
      hideTitle: true,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: 'Псевдо', dataIndex: 'pseudo', width: 100},
          {header: 'Название', dataIndex: 'full_name'}
        ]
      }),
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      border: false,
      viewConfig: {
        forceFit:true,
        enableRowBody:false,
        scrollOffset: 2
      },
      tbar: [{
        text: 'Добавить шаг процедуры',
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
        handler: function() {
          var win = getWindow();
          win.show();
        }
      }],
      bbar: renderPagingToolbar('Шаги процедуры', store, 25, null),
      listeners: {
        render: function() {
          store.load();
        },
        click: {
          scope: this,
          fn: function() {
            var selectedRow = this.getSelectionModel().getSelected();
            if (selectedRow) {
              performRPCCall(RPC.Admin.loadvocabprocedurestep, [{id: selectedRow.data.id}], {wait_text: 'Загрузка шага...'}, function(result) {
                var win = getWindow(result);
                win.show();
              });
            }
          }
        }
      }
    });
    Application.components.VocabProcedureStepsGrid.superclass.initComponent.call(this);
  }
});
