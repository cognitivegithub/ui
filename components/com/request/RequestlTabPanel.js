
Ext.define('Application.components.RequestTabPanel', {
  extend: 'Ext.TabPanel',
  initComponent: function() {
  var component = this;

  var AllRequestPanel = {
   xtype: 'Application.components.RequestGrid',
   parent: component,
   title: 'Запросы на разъяснение',
   optype: 'allrequest',
   closable: false
  };

  var RequestPanel = {
    xtype: 'Application.components.RequestGrid',
    parent: component,
    title: 'Необработанные запросы',
    optype: 'request',
    closable: false
  };

  var ResponsePanel = {
    xtype: 'Application.components.RequestGrid',
    parent: component,
    title: 'Ответы на запросы',
    optype: 'response',
    closable: false
  };

  var RejectPanel = {
    xtype: 'Application.components.RequestGrid',
    parent: component,
    title: 'Отклоненные запросы',
    optype: 'rejected',
    closable: false
  };

  Ext.apply(RequestPanel, component.requestGridParams);
  Ext.apply(ResponsePanel, component.requestGridParams);
  Ext.apply(RejectPanel, component.requestGridParams);
  Ext.apply(AllRequestPanel, component.requestGridParams);

  var activeTab = parseInt(component.activeTab);
  if (isNaN(activeTab)) {
      activeTab = 0;
  }

       Ext.apply(this, {
           activeTab: activeTab,
           enableTabScroll:false,
           border: false,
           items:[
              AllRequestPanel,
              RequestPanel,
              ResponsePanel,
              RejectPanel
        ]
      });

  Application.components.RequestTabPanel.superclass.initComponent.call(this);
  }
});