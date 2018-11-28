
Ext.define('Application.components.ProcedureTypeSetupGrid', {
  extend: 'Ext.grid.EditorGridPanel',
  initComponent: function() {
    var grid_id=Ext.id();
    var store = new Ext.data.DirectStore({
      autoLoad: true,
      autoDestroy: true,
      api: {
        read: RPC.Admin.listProcedureTypes,
        update: RPC.Admin.updateProcedureTypes
      },
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'rows',
      fields: ['id', 'name', 'applic_publish_from', 'applic_publish_to', 'applic_opened_from', 'applic_opened_to', 'end_firstparts_from', 'end_firstparts_to', 'begin_auction_from', 'begin_auction_to', 'end_secondparts_from', 'end_secondparts_to', 'actual']
    });
    
    var stateStore = new Ext.data.ArrayStore({
      id: 0,
      fields: [
          'actual',
          'name'
      ],
      data: [
        [0, 'Отключен'],
        [1, 'Включен']
      ]
    });
    
    var stateCombo = new Ext.form.ComboBox({
      typeAhead: true,
      triggerAction: 'all',
      lazyRender: true,
      listClass: 'x-combo-list-small',
      store : stateStore,
      mode: 'local',
      valueField: 'actual',
      hiddenName: 'actual',
      displayField: 'name'
    });
    
    
    Ext.apply(this, {
        id: grid_id,
        store: store,
        title: 'Настройки типов процедур',
        viewConfig: {
          forceFit: true
        },
        columns: [
          {header: '#', dataIndex: 'id', hidden: true, sortable: true},
          {header: 'Тип процедуры', dataIndex: 'name', editor: Ext.ux.helpers.textEdit(), sortable: true, width: 150},
          {header: 'На подачу заявок<br>(не менее)', dataIndex: 'applic_publish_from', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'На подачу заявок<br>(не более)', dataIndex: 'applic_publish_to', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'Вскрытие конвертов<br>(не менее)', dataIndex: 'applic_opened_from', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'Вскрытие конвертов<br>(не более)', dataIndex: 'applic_opened_to', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'На рассмотрение<br>(не менее)', dataIndex: 'end_firstparts_from', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'На рассмотрение<br>(не более)', dataIndex: 'end_firstparts_to', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'До проведения<br>(не менее)', dataIndex: 'begin_auction_from', sortable: false, 
           editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'До проведения<br>(не более)', dataIndex: 'begin_auction_to', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {header: 'На подведение итогов<br>(не менее)', dataIndex: 'end_secondparts_from', sortable: false,
          editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {
            header: 'На подведение итогов<br>(не более)', dataIndex: 'end_secondparts_to', sortable: false,
            editor: new Ext.form.NumberField({
            allowBlank: true,
            allowNegative: false,
            maxValue: 30
          })},
          {
           header: 'Состояние', dataIndex: 'actual', width: 60, sortable: false,
           editor: stateCombo,
           renderer: Ext.util.Format.comboRenderer(stateCombo)
          }
        ],
        tbar: [{
         xtype: 'tbtext',
         text: 'Для редактирования значений в полях таблицы щелкните на поле дважды'
        }],
        bbar: [{
           xtype: 'tbtext',
           text: 'Вы можете включить и выключить типы процедур на площадке, а также задать блокирующие периоды в календаре в форме создания процедуры, помогающие более корректно вводить данные.'
         }, 
         '->',
         {
           text: 'Сохранить',
           frame: true,
           cls:'x-btn-text-icon',
           icon: 'ico/database_save.png',
           handler: function() {
             store.save();
           }
         }
      ],
      listeners: {
        beforeedit: function(e) {
          if (!e.record.data.id) {
            return false;
          }
          return true;
        },
        save: function() {
          store.reload();
        }
      }
    });
    Application.components.ProcedureTypeSetupGrid.superclass.initComponent.call(this);
  }
});
