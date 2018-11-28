/**
 * Компонент выводит филдсет с информацией о конторе (в заявку, к примеру).
 *
 * Параметры: cmp_data - данные процедуры
 */

Ext.define('Application.components.accreditationPanel', {
  extend: 'Ext.panel.Panel',
  autoHeight: true,
  border: false,
  style: 'margin: 5px 5px 10px; border-width: 1px;',
  bodyStyle: 'padding: 10px 10px 0;',
  
  initComponent: function() {
    var component = this;
    
    Ext.apply(this, {
      labelWidth: 300,
      layout: 'form',
      defaults: {
        anchor: '100%',
        allowBlank: false,
        defaults: {
          allowBlank: false,
          
          anchor: '100%'
        }
      },
      items: [          
        {
          xtype: 'textfield',
          readOnly: true,
          value: parseDate(component.accred.date_resolved).format('d.m.Y H:i'),
          style: 'background: transparent; border: none;',
          fieldLabel: 'Дата предоставления аккредитации'
        },
        {
          xtype: 'textfield',
          readOnly: true,
          style: 'background: transparent; border: none;',
          value: component.accredType=='customer' ? component.cmpData.valid_for_cust : component.cmpData.valid_for_suppl,
          fieldLabel: 'Дата окончания аккредитации'
        },
        {
          xtype: 'Application.components.filelistPanel',
          title: 'Аккредитационные документы',
          withHash: false,
          listeners: {
            beforerender: function() {
              var cmp = this;
              var accred_files = null;
              if (component.accredType=='supplier') {
                accred_files= component.cmpData.accreditation_files_with_reqs.supplier;
              }
              if (component.accredType=='customer') {
                accred_files= component.cmpData.accreditation_files_with_reqs.customer;
              }
              var fileItems = [];
              if (accred_files) {
                for (var i = 0; i < accred_files.length; ++i) {
                  if (accred_files[i].html.length) {
                    fileItems.push({subheader: accred_files[i].req_name + ':'});
                    for (var j = 0; j < accred_files[i].html.length; ++j) {
                      fileItems.push(accred_files[i].html[j]);
                    }
                  }
                }
              }
              if(fileItems) {
                cmp.setValues(fileItems);
              }
            }
          }
        },
        {
          xtype: 'Application.components.filelistPanel',
          title: 'Доверенности пользователей',
          withHash: false,
          hidden:true,
          listeners: {
            beforerender: function() {
              var cmp = this;
              var files = component.cmpData.procuracy_files;
              var fileItems = [];
              if (files !== undefined ) {
                this.hidden = false;
                if (files) {
                  for (var i = 0; i < files.length; ++i) {
                    fileItems.push(files[i]);
                  }
                }
              }
              if(fileItems) {
                cmp.setValues(fileItems);
              }
            }
          }
        }
      ]
    });
    Application.components.accreditationPanel.superclass.initComponent.call(this);
  }
});
