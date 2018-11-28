/**
 * Компонент выводит форму рассмотрения заявки на аккредитацию.
 *
 * Параметры:
 * id - id заявки
 * type - тип контрагента (supplier/customer)
 */
Application.components.AccreditationReviewForm = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    Application.components.AccreditationReviewForm.superclass.initComponent.call(this);
  },
  listeners: {
    render: function() {
      var user_type_text = (this.params.type == 'supplier' ? 'заявителя' : 'заказчика');
      var user_type_text2 = (this.params.type == 'supplier' ? 'заявителю' : 'заказчику');
      RPC.Accreditation.review(this.params, function(result) {
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
            if (files[i] && files[i].html && files[i].html.length) {
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
          bodyCssClass: 'subpanel',
          items : [
            {
              xtype:'fieldset',
              title: 'Данные сертификата ' + user_type_text,
              layout: 'table',
              layoutConfig: {columns: 2},
              cls: 'auction_table',
              defaults: {border: false},
              items: certificateItems
            }, {
              xtype:'fieldset',
              title: 'Основные данные ' + user_type_text,
              autoHeight: true,
              layout: 'table',
              layoutConfig: {columns: 2},
              defaults: {border: false},
              items: [
                {
                  cellCls: 'th',
                  html: 'Тип профиля:'
                }, {
                  html: application.profile_name
                }, {
                  cellCls: 'th',
                  html: 'ИНН:'
                }, {
                  html: application.inn
                }, {
                  cellCls: 'th',
                  html: 'КПП:'
                }, {
                  html: application.kpp
                }
              ]
            }, {
              xtype:'fieldset',
              title: 'Аккредитовать ' + user_type_text,
              items: [{
                html: 'Для аккредитации заявителя оператор должен проверить достоверность прикрепленных документов и установить их соответствие законодательству РФ. Отметьте галочкой сведения, которые соответствуют указанным в приложенных документах. Если какие-либо данные не соответствуют, такому заявителю необходимо отказать в аккредитации.',
                border: false,
                style: 'margin-bottom: 10px; padding-right: 15px'
              }, {
                xtype: 'panel',
                border: false,
                items: [{
                  xtype: 'Application.components.filelistPanel',
                  title: 'Документы',
                  files: fileItems,
                  withHash: false
                }]
              }, {
                xtype: 'Application.components.accreditationAgreeForm',
                application: application,
                accId: result.id,
                accType: result.type,
                confirmation: confirmation,
                hide_frame: true
              }
            ]
            }, {
              xtype: 'fieldset',
              title: 'Отказать в аккредитации ' + user_type_text2,
              style: 'margin-top: 10px',
              id: 'declinePanel',
              items: [{
                html: 'Укажите причину отказа в аккредитации заявителю <span class="red">' + application.full_name + '</span>. Указанная причина будет отправлена заявителю по электронной почте в составе уведомления об отказе. Причина должна содержать указание на основание принятия решения об отказе, в то числе указание на отсутствующие документы и сведения или не соответствующие требованиям законодательства Российской Федерации документы и сведения.',
                border: false,
                style: 'margin-bottom: 15px; text-align: left;'
              }, {
                xtype: 'Application.components.accreditationDeclineForm',
                accId: result.id,
                accType: result.type,
                requirements: result.requirements,
                hide_frame: true
              }]
            }
          ]

        });
        Ext.getCmp('reviewPanel').insert(0,cmpPanel);
        Ext.getCmp('reviewPanel').doLayout();
      });
    }
  }
});
