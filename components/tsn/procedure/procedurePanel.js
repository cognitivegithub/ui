/**
 * @class Application.components.procedureShortView
 * @extends Ext.panel.Panel
 *
 * Просмотр извещения о проведении аукциона.
 *
 *
 */
Ext.define('Application.components.procedurePanel', {
  extend: 'Ext.panel.Panel',

  //title: 'Извещение о проведении открытого аукциона в электронной форме',
  frame: true,
  border: false,

  initComponent: function() {
    var maincmp = this;
    maincmp.buttons = [];
    var apply_button_id = Ext.id();
    this.items = [
      {
        xtype             : 'Application.components.procedureInfo',
        //title             : 'Cведения о процедуре',
        //frame             : true,
        procedure_id      : maincmp.procedure_id,
        listeners     : {
          'dataload'  : function(procedure) {
            if(isSupplier() && procedure.status==2) {
              Ext.getCmp(apply_button_id).show();
            }
          }
        },
        procedureAutoLoad : true
      }, // Cведения о процедуре
      
      {
        title       : 'Сведения об организаторе',
        xtype       : 'Application.components.keyValuePanel',
        autoHeight  : true,
        style     : 'margin: 5px;',
        listeners     : {
          'dataload'  : function(data) {
            this.setValues(data, true);
          }
        },

        fields: {
          'org_full_name'         : 'Наименование организатора:',
          'org_customer_type'     : 'Тип организатора:',
          'org_main_address'      : 'Юридический адрес:',
          'org_postal_address'    : 'Почтовый адрес:',
          'contact_phone'         : 'Контактный телефон:',
          'contact_email'         : 'Адрес электронной почты:',
          'contact_person'        : 'Ф.И.О. контактного лица:'
        }
      }]; // Сведения об организаторе
      
      this.items.push({
        xtype         : 'panel',
        title         : 'Сведения о лоте',
        frame         : false,
        border        : false,
        style         : 'margin: 0px 5px 5px 5px; border-width: 1px;',
        listeners     : {
          'dataload'  : function(data) {
            // TODO: Выдавать ошибку в этом случае?
            if (!data) return;
            // Принудительный файр подлежащей табпанели, т.к. заранее релеить нет смысла.
            //this.getComponent(0).fireEvent('dataload', data);
            var component = this;
              var lotTemplates = Application.models.Tsn_Lot.getLotTemplates();
              var items = Application.models.Tsn_Lot.getLotPanelItems(data, lotTemplates);

              var lotPanel = {
                xtype       : 'panel',
                autoHeight  : true,
                hideTitle   : true,
                style       : 'padding: 0 5px 10px',
                items       : items
              };
              component.add(lotPanel); // component.add
              component.doLayout();
          }
        }
      } // Панель c данными о лоте

    ); // procedurePanel items
    
    maincmp.buttons.push(
      {
        scale       : 'medium',
        id          : apply_button_id,
        hidden      : true,
        tooltip     : 'Подать предложение',
        text        : 'Подать предложение',
        handler     : function() {
          redirect_to(String.format( 'tsn/applic/create/lot/{0}/procedure/' + procedure.id, procedure.lot_id ) );
        }
      },
      {
        text        : 'История изменений',
        tooltip     : 'История изменений извещения',
        scale       : 'medium',
        handler     : function() {
          redirect_to('tsn/procedure/history/procedure/'+maincmp.procedure_id);
        }
      }
    );

    this.on('beforerender', function() {
      // Релеим событие загрузки данных родлежащим компонентам
      // от первого, Application.components.procedureViewPanel
      var procedureViewPanel = this.getComponent(0);
      this.items.each(function(item, index) {
        if (index == 0) return;
        //item.addEvents('dataload');
        item.relayEvents(procedureViewPanel, ['dataload']);
      });
    }, this);

    Application.components.procedurePanel.superclass.initComponent.call(this);
  }
});
