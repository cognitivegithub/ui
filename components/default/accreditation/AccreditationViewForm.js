/**
 * Компонент выводит заявку на аккредитацию.
 *
 * Параметры:
 * id - id заявки
 * type - тип контрагента (supplier/customer)
 */
Application.components.AccreditationViewForm = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    Application.components.AccreditationViewForm.superclass.initComponent.call(this);
  },
  listeners: {
    render: function() {
      var component = this;
      var user_type_text = (this.params.type == 'supplier' ? 'заявителя' : 'заказчика');
      var user_type_text2 = (this.params.type == 'supplier' ? 'заявителе' : 'заказчике');
      RPC.Accreditation.load(this.params, function(result) {
        var application  = result.application;
        var files        = result.files;
        var confirmation = result.confirmation;
        var certFields   = [
          {'id-at-organizationName': 'Название организации:'},
          {'id-at-organizationalUnitName':'Подразделение:'},
          {'id-at-commonName':'ФИО:'},
          {'id-at-title': 'Должность:'},
          {'e-Mail': 'E-mail:'},
          {'id-at-stateOrProvinceName':'Город:'}
        ];
        var cert = application.certificate;
        var certificateItems = [{html: 'Данные отсутствуют'}];

        if (cert) {
          var cData = application.certificate['dn'];

          certificateItems = [
            {
              cellCls: 'th',
              html: 'Сертификат действителен:'
            }, {
              html: 'с ' + cert['valid-from'].substr(0, cert['valid-from'].length-4) + ' по '+ cert['valid-for'].substr(0, cert['valid-for'].length-4)
            },
            {
              cellCls: 'th',
              html: 'Сертификат выдан:'
            }, {
              html: cert['dn-signed-by']['id-at-organizationName'] + (cert['dn-signed-by']['id-at-organizationalUnitName'] ? ' ' + cert['dn-signed-by']['id-at-organizationalUnitName'] : '')
            }
          ]
          for(var i = 0; i < certFields.length; i++) {
            var item = certFields[i];
            for(var j in item) {
              if (item.hasOwnProperty(j)) {
                certificateItems.push({cellCls: 'th', html: item[j]}, {html: cData[j]});
              }
            }
          }
        }

        var fileItems = [];
        if (files) {
          for (var i = 0; i < files.length; ++i) {
            if (files[i].html.length) {
              fileItems.push({subheader: files[i].req_name + ':'});
              for (var j = 0; j < files[i].html.length; ++j) {
                fileItems.push(files[i].html[j]);
              }
            }
          }
        }

        var cmpPanel = new Ext.Panel({
          labelWidth: 200,
          frame: true,
          autoScroll: true,
          layout: 'anchor',
          bodyCssClass: 'subpanel-top-padding',
          items : [{
            xtype:'fieldset',
            title: 'Данные сертификата ' + user_type_text,
            layout: 'table',
            layoutConfig: {columns: 2},
            cls: 'auction_table',
            defaults: {border: false},
            items: certificateItems
          }, {
            xtype: 'panel',
            border: false,
            items: [
              {
                title       : 'Сведения о '+user_type_text2,
                xtype       : 'Application.components.keyValuePanel',
                autoHeight  : true,
                values      : application,
                fields: {
                  full_name     : 'Наименование организации:',
                  short_name    : 'Краткое наименование:',
                  inn           : 'ИНН:',
                  ogrn          : 'ОГРН:',
                  legal_address : 'Юридический адрес:'
                }
              }, {
                xtype: 'Application.components.filelistPanel',
                title: 'Документы',
                files: fileItems,
                withHash: false,
                style: 'margin-bottom: 0px;'
              }
            ]
          }],
          buttons: [{
            text: 'Назад',
            handler: function() {
              history.back(-1);
            }
          }]
        });
        component.insert(0,cmpPanel);
        component.doLayout();
      });
    }
  }
});
