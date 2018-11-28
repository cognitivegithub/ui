Ext.define('Application.components.ProcedureStepInfo', {
  extend: 'Ext.Window',
  modal: true,
  autoSize: true,
  autoScroll: true,
  hideAction: 'close',
  width: 900,
  bodyStyle: 'padding: 5px 10px 10px;',
  title: 'Стадия закупки',

  userTemplate: new Ext.XTemplate('<table class="tpltbl">' +
    '<colgroup><col width="30%"><col width="70%"></colgroup>' +
    '<tr><th style="padding: 1px;">Подразделение:</th><td>{department}</td></tr>' +
    '<tr><th style="padding: 1px;">ФИО:</th><td>{fullname}</td></tr>' +
    '<tr><th style="padding: 1px;">Телефон:</th><td>{phone}</td></tr></table>'),
  agreeTemplate: new Ext.XTemplate('<table class="tpltbl">' +
    '<colgroup><col width="30%"><col width="70%"></colgroup>' +
    '<tr><th style="padding: 1px;">Подразделение:</th><td>{name}</td></tr></table>'),

  data: null,
  mode: 'load',
  constrain: true,
  initComponent: function() {
    var component = this;

    var items = [];

    // Инициатор.
    items.push({
      xtype: 'fieldset',
      title: 'Инициатор закупки',
      style: 'padding: 4px 6px;',
      tpl: component.userTemplate,
      data: component.data.userCreate
    });

    // Ответственный ООЗ.
    if (null != component.data.userAppointed) {
      items.push({
        xtype: 'fieldset',
        title: 'Ответственный за закупку (345)',
        style: 'padding: 4px 6px;',
        tpl: component.userTemplate,
        data: component.data.userAppointed
      });
    }

    // Согласующие на параллельных согласованиях.
    if (component.data.agreeDepartments.length > 0 && component.isShowAgreeDepartments()) {
      var subitems = [];
      Ext.each(component.data.agreeDepartments, function (agreeDepartment) {
        subitems.push({
          xtype: 'displayfield',
          hideLabel: true,
          tpl: component.agreeTemplate,
          data: agreeDepartment
        });
      });
      items.push({
        xtype: 'fieldset',
        title: 'Сейчас заявку обрабатывает',
        style: 'padding: 4px 6px;',
        items: subitems
      });
    }

    var itemTree  = {
      xtype: 'treepanel',
      bodyStyle: {height: '450px', overflow: 'auto'},
      root: {
        autoHeight: true,
        expanded: true,
        children: component.data.steps
      },
      columnWidth: '1',
      rootVisible: false
    };

    component.items = [{
        layout:'column',
        frame : false,
        border: false,
        bodyStyle: 'background-color: inherit',
        items:[{
          bodyStyle: 'background-color: inherit; padding-right: 10px;',
          frame : false,
          border: false,
          columnWidth:.5,
          items: items
        },{
          frame : false,
          border: false,
          autoHeight: true,
          columnWidth:.5,
          items: [itemTree]
        }]
    }];


    component.buttons = [{
      text: 'Закрыть',
      handler: function () {
        component.close();
      }
    }];

    Application.components.ProcedureStepInfo.superclass.initComponent.call(this);
  },
  listeners: {
    onStoreDataLoad: function(data) {
      console.log(data);
    }
  },
  isShowAgreeDepartments: function () {
    if (this.data.currentStepId) {
      var availableSteps = [
        PSEUDO_STEP_CONTRACT_DEPARTMENTS_AGREE,
        PSEUDO_STEP_DEMAND_WAIT_AGREEMENT_OEB,
        PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_DEPARTMENTS,
        PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_DEPARTMENTS_SIMPLE,
        FILTER_PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_DEPARTMENTS_EP
      ];
      return in_array(this.data.currentStepId, availableSteps);
    }
    return false;
  }
});
