Ext.define('Application.components.ContractListPanel', {
  extend: 'Ext.form.FormPanel',
  autoHeight: true,
  layout : 'form',
  labelWidth: 200,
  frame: true,
  defaults: {
    xtype: 'fieldset',
    style: 'margin: 5px 5px 0px;',
    bodyCssClass: 'subpanel',
    collapsible: false,
    defaults: {
      xtype: 'fieldset',
      collapsible: false
    }
  },
  monitorValid : true,
  signInfo: {},
  mode: null,
  types: null,
  lotInfo: null,
  lotStatus: null,
  lotInfoButtons: null,
  files: {},
  suppliers: null,
  currentSupplier: null,
  currentCustomer: null,
  currentContract: null,
  agreementRequired: null,
  signatureRequired: null,
  participants_eds_info: null,
  uploadPanelId: null,
  win: null,
  notAgreedPanel: null,
  contractInfo: null,
  stagePanel: null,
  signDate: null,
  sign_window_id: null,
  wait_customer_requirements_text: 'Ожидаются требования заказчика к заключению договора.',
  waitParams: {
    mask: true,
    handle_failure: true,
    scope: this,
    monitor_valid: this,
    wait_text: 'Загружается список договоров'
  },
  agreedPanel: null,

  initComponent: function() {
    var component = this;
    this.addEvents('reload');
    this.addEvents('agreed');
    component.govru_button_fset_id = Ext.id()

    component.lotInfoButtons = [];
    component.notAgreedPanel = {
      buttonAlign: 'center',
      bbar: new Ext.Panel({
        html: '<div class="normal-text" style="text-align: center; font-size: 12px !important;">Если вы согласны с проектом договора, нажмите кнопку «Согласовано»</div>'
      }),
      buttons: [{
        text: 'Согласовано',
        handler: function() {
          component.fireEvent('agreed');
        }
      }]
    };

    component.contractInfo = {
      xtype: 'panel',
      collapsible: false,
      id: 'contractInfo',
      style: 'margin: 5px 1px 0 1px;'
    };

    component.stagePanel = {
      xtype: 'fieldset',
      buttonAlign: 'center'
    };

    function generateInfoPanel(info_text, invert_margin, eds_link_type) {
      var singed_link = '';
      var panel_items = [{
            xtype: 'panel',
            columnWidth: 1,
            html: '<div class="normal-text" style="text-align: center; font-size: 12px !important;">' + info_text + '</div>'
          }];
      if (component.lotInfo && (component.lotInfo.status >= 7) && eds_link_type) {
        var contract_file = null;
        for(var pp in component.files) {
          if (component.files.hasOwnProperty(pp)) {
            if (component.files[pp].type_id == Application.models.Contract.FILE_TYPE.draft) {
              contract_file = component.files[pp];
              break;
            }
          }
        }
        if (contract_file && component.participants_eds_info && component.participants_eds_info[eds_link_type]) {
          var file_link = contract_file.link;
          if (component.currentContract.customerSigned && eds_link_type == 'customer') {
            file_link += '/extract/1';
          } else if (component.currentContract.supplierSigned && eds_link_type == 'supplier') {
            file_link += '/extract/2';
          }
          singed_link = '<span style="padding-left: 10px;"><a href="' + file_link + '" title="Контейнер PKCS#7"><img src="/ico/sign.png"></a></span>';
          panel_items = [{
            xtype: 'panel',
            columnWidth: .6,
            html: '<div class="normal-text" style="text-align: right; font-size: 12px !important; padding-right: 10px;">' + info_text + singed_link + '</div>'
          }, {
            xtype: 'panel',
            columnWidth: .4,
            items: [
            {
              xtype: 'button',
              text: 'Реквизиты ЭП',
              handler: function(){
                Application.models.Contract.showEdsInfo(Ext.util.Format.nl2br(component.participants_eds_info[eds_link_type]));
              }
            }]
          }];
        }
      }
      return {
        xtype: 'fieldset',
        layout: 'column',
        style: invert_margin ? 'margin-top: 10px; margin-bottom: 0px; padding: 10px 0 7px;' : 'padding: 10px 0 7px;',
        items: panel_items
      };
    }

    component.agreedPanel = generateInfoPanel('Заявитель согласен с проектом договора.');
    component.agreedNotNeededPanel = generateInfoPanel('Согласование не требуется.');
    component.waitCustomerRequirementsPanel = generateInfoPanel(component.wait_customer_requirements_text);

    function setCurrentContract(curContract) {
      component.currentContract = curContract;
      if (!curContract) {
        component.currentContract = {'agreed':false, 'id': null};
      }
    }

    var showOOSPublishForm = function() {
      var winId = Ext.id();

      var eventWindow = new Ext.Window({
          closeAction: 'close',
          width: 800,
          height: 250,
          layout: 'fit',
          id: winId,
          title: 'Публикация договора на zakupki.gov.ru',
          items: [
            {
              xtype: 'Application.components.ContractOOSPublisForm',
              winId: winId,
              buttonId: component.govru_button_fset_id,
              contract_id: component.currentContract.id,
              height: 229,
              labelWidth: 250
            }
          ]
        });
        eventWindow.show();
    }

    function makeText(obj) {
      component.signDate = Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', '');
      var supplier = Application.models.Contract.findRecordById(component.currentSupplier, component.suppliers);
      var customer = Application.models.Contract.findRecordById(component.currentCustomer, component.customers);
      var text = 'Настоящим подтверждается подпись ' + obj +' договора по процедуре ' + component.lotInfo.registry_number + ', лот "' + component.lotInfo.title+'". '+
        'Контрольная сумма ГОСТ Р34.11-94: '+component.currentContract.hash+" "+
        'Заказчик: '+customer.full_name+' '+
        'Заявитель: '+supplier.full_name+' '+
        'Дата публикации: '+ component.signDate;
      return text;
    }

    function makeTextRepudiation(hash) {
      component.signDate = Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', '');
      var supplier = Application.models.Contract.findRecordById(component.currentSupplier, component.suppliers);
      var customer = Application.models.Contract.findRecordById(component.currentCustomer, component.customers);
      var text = 'Настоящим подтверждается отказ заказчика от заключения договора с заявителем по процедуре ' + component.lotInfo.registry_number + ', лот "' + component.lotInfo.title+'". '+
        'Контрольная сумма ГОСТ Р34.11-94: '+hash+" "+
        'Заказчик: '+customer.full_name+' '+
        'Заявитель: '+supplier.full_name+' '+
        'Дата публикации: '+ component.signDate;
      return text;
    }

    function isSupplierCanSign() {
      if (Main.config.contracts_no_check_date) {
        return true;
      }
      var last_date_for_sign = parseDate(component.currentContract.date_agreed_end, 'c'); //.add(Date.DAY, 7);
      last_date_for_sign = new Date(last_date_for_sign.getFullYear(), last_date_for_sign.getMonth(), last_date_for_sign.getDate());
      var c_date = new Date();
      var cur_date = new Date(c_date.getFullYear(), c_date.getMonth(), c_date.getDate());
      var diff = Math.floor((cur_date.getTime() - last_date_for_sign.getTime()) / (1000*60*60*24));
      return diff > 0 ? false : true;
    }

    function getSupplierSignedPanel() {
      var items = [];
      var fieldset_title = 'Стадия согласования проекта договора c заявителем';
      if (component.currentContract.agreed && component.lotInfo.status == 7) {
        fieldset_title = 'Стадия подписи проекта договора заявителем';
      } else if (component.lotInfo.status == 8) {
        fieldset_title = 'Договор, подписанный уполномоченным представителем заявителя';
      }
      var docpanel = Ext.apply({}, {
        bodyCssClass: 'subpanel',
        title: fieldset_title,
        items: items
      }, component.stagePanel);
      var empty_supplier_signed_panel = false;
      if (component.currentContract.supplierSigned) {
        var date_supplier_eds = '';
        if (component.currentContract.date_supplier_eds) {
          date_supplier_eds = ', ' + Ext.util.Format.localDateText(parseDate(component.currentContract.date_supplier_eds));
        }
        docpanel.items.push(generateInfoPanel('Проект договора подписан заявителем' + date_supplier_eds + '.', false, 'supplier'));
      } else {
        if (component.currentContract.agreed) {
          if (!component.supplierRefusedSign) {
            docpanel.items.push(generateInfoPanel('Заявитель согласен с проектом договора.'));
            if (2==component.signatureRequired) {
              docpanel.items.push(generateInfoPanel('При заключении договора в письменной форме заявитель подписывает документы договора на бумаге'));
            } else if (component.signatureRequired) {
              var supplier_max_date = Ext.util.Format.localDateOnlyRenderer(parseDate(component.currentContract.date_agreed_end, 'c')); //.add(Date.DAY, 7));
              if (!isSupplierCanSign()) {
                docpanel.items.push(generateInfoPanel('Крайний срок подписания заявителем ' + supplier_max_date + ' истек.'));
              } else {
                docpanel.items.push(generateInfoPanel('Крайний срок подписания заявителем: ' + supplier_max_date));
              }
            }
          } else {
            docpanel.items.push(generateInfoPanel('Заявитель согласен с проектом договора, но отказался от заключения договора в электронном виде.'));
          }
        } else {
          if (2==component.signatureRequired) {
            docpanel.items.push(generateInfoPanel('При заключении договора в письменной форме заявитель подписывает документы договора на бумаге'));
          } else {
            empty_supplier_signed_panel = true;
          }
        }
      }

      if (component.lotInfo.guarantee_needed) {
        docpanel.items.push({
          xtype: 'fieldset',
          title: 'Подписанные участником размещения заказа гарантийные обеспечения',
          hidden: (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.supplier_guarantee)>0 ? false : true),
          items: {
            xtype: 'ux.contractlist',
            files: component.files,
            hideEds: true,
            hide_date_added_col: true,
            filesFilter: {type_id: Application.models.Contract.FILE_TYPE.supplier_guarantee}
          }
        });
      }
      if (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.discrepancy)>0) {
        docpanel.items.push({
          xtype: 'panel',
          border: false,
          frame: true,
          title: 'Протоколы разногласий',
          items: {
            xtype: 'ux.contractlist',
            hideEds: true,
            hide_date_added_col: true,
            files: component.files,
            filesFilter: {type_id: Application.models.Contract.FILE_TYPE.discrepancy}
          }
        });
      }
      if (component.lotInfo.status == 8 && (!component.files || component.files.length == 0)) {
        docpanel.items.push(generateInfoPanel('Согласование не проводилось.'));
      }
      if (component.lotInfo.status == 7) {
        if (component.lotInfo.contract_supplier_id == component.currentSupplier) {
          if (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)==0
              && 2!=component.signatureRequired)
          {
            docpanel.items.push(generateInfoPanel(component.wait_customer_requirements_text));
          } else if (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0
                      && Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.discrepancy) == 0
                      && empty_supplier_signed_panel == true) {
            docpanel.items.push(generateInfoPanel('Ожидаются требования заявителя к заключению договора.'));
          }
        } else {
          docpanel.items.push(generateInfoPanel('Договор с участником не заключается.'));
        }
      }
      if (component.lotInfo.status == 8 && docpanel.items.length == 0) {
        docpanel.hidden = true;
      }
      return docpanel;
    }

    function getCustomerLoadedPanel() {
      var fieldset_title = 'Стадия согласования проекта договора с заказчиком';
      if (2==component.signatureRequired) {
        fieldset_title = 'Стадия подтверждения заключения договора';
      }
      if (component.currentContract.agreed && component.lotInfo.status == 7) {
        fieldset_title = 'Стадия подписи проекта договора заказчиком';
      } else if (component.lotInfo.status == 8) {
        fieldset_title = 'Договор, подписанный уполномоченным представителем заказчика';
      }
      var docpanel = Ext.apply({}, {
        bodyCssClass: 'subpanel',
        title: fieldset_title,
        items: []
      }, component.stagePanel);

      if (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0) {
        docpanel.items.push({
          xtype: 'panel',
          border: false,
          frame: true,
          title: 'Загруженные заказчиком '+(2==component.signatureRequired?'договоры':'проекты договора'),
          hidden: (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0 ? false : true),
          items: {
            xtype: 'ux.contractlist',
            hideEds: true,
            hide_date_added_col: true,
            files: component.files,
            filesFilter: {type_id: Application.models.Contract.FILE_TYPE.draft}
          }
        });
      }

      if (component.currentContract.customerSigned) {
        var date_customer_eds = '';
        if (component.currentContract.date_customer_eds) {
          date_customer_eds = ', ' + Ext.util.Format.localDateText(parseDate(component.currentContract.date_customer_eds));
        }
        var confirm_text = 'Проект договора подписан заказчиком';
        if (2==component.signatureRequired) {
          confirm_text = 'Заключение договора подтверждено';
        }
        docpanel.items.push(generateInfoPanel(confirm_text+date_customer_eds+'.', true, 'customer'));
        if(component.currentContract.send_to_oos && Main.config.send_contracts_to_oos) {
          docpanel.items.push({
                xtype: 'fieldset',
                frame: false,
                border: true,
                hidden: component.currentContract.oos_publish_status>0,
                buttonAlign: 'center',
                id: component.govru_button_fset_id,
                style: 'margin-top: 10px; margin-bottom: 0px; padding: 10px 0 7px',
                items: [
                  {
                    xtype: 'panel',
                    frame: false,
                    border: false,
                    html: '<b>Внимание!</b> Прежде чем пытаться передавать договор на zakupki.gov.ru, ' +
                    'убедитесь, что в личном кабинете в ЕИС даннная закупка <b>завершена</b>.'
                  }
                ],
                buttons: [{
                  text: 'Передать на zakupki.gov.ru',
                  handler: showOOSPublishForm
                }]
              });
          if(component.currentContract.oos_publish_status!=0 && !Ext.isEmpty(component.currentContract.oos_publish_status)) {
            var oos_status_text = 'Договор ожидает публикации на zakupki.gov.ru. Дата передачи '+date_transfer;
            var date_transfer = 'указана в списке событий по процедуре';

            if(component.currentContract.date_send_to_oos) {
              var dt = parseDate(component.currentContract.date_send_to_oos);
              if(dt) {
                date_transer = dt.format('d.m.Y H:i');
              }
            }
            switch(component.currentContract.oos_publish_status) {
              case -1:
                oos_status_text = 'Договору отказано в публикации на zakupki.gov.ru. Дата передачи ' +
                  date_transfer + '. Подробности в списке событий Взаимодействие с ЕИС';
                break;
              case 2:
                oos_status_text = 'Договор опубликован на zakupki.gov.ru. Дата передачи '+date_transfer+'. В ходе публикации договору присвоен реестровый номер '+component.currentContract.oos_registry_number;
                break;
            }
            docpanel.items.push(generateInfoPanel(oos_status_text, true));
          }
        }
      }

      if (component.lotInfo.status == 8 && (!component.files || component.files.length == 0)) {
        if (component.agreementRequired === false) {
          docpanel.items.push(component.agreedNotNeededPanel);
        } else {
          docpanel.items.push(generateInfoPanel('Согласование не проводилось.'));
        }
      }

      if (component.lotInfo.status == 7
        && Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)==0) {

        if (component.currentSupplier == component.lotInfo.contract_supplier_id) {
          if (2==component.signatureRequired) {
            docpanel.items.push(generateInfoPanel('Ожидается подтверждение заключения договора со стороны Заказчика'));
          } else {
            docpanel.items.push(generateInfoPanel(component.wait_customer_requirements_text));
          }
        } else {
          docpanel.items.push(generateInfoPanel('Договор с участником не заключается.'));
        }
      }

      if (component.lotInfo.status == 8 && docpanel.items.length == 0) {
        docpanel.hidden = true;
      }
      return docpanel;
    }

    // Панель отказа от заключения договора
    function getCustomerRepudiationPanel() {
      var button, draft_file, signed_file, i, files_count;

      files_count = component.files.length;
      for(i = 0; i < files_count; ++i) {
        if (component.files[i].type_id == Application.models.Contract.FILE_TYPE.repudiation
              && component.files[i].supplier_id == component.currentSupplier) {

          if (component.files[i].customerSigned && component.files[i].is_last_version) {
            signed_file = component.files[i];
          } else {
            draft_file = component.files[i];
          }
          break;

        }
      }

      if (component.currentCustomer != Main.user.contragent_id && !signed_file) {
        return null;
      }
      if (component.currentSupplier != component.lotInfo.contract_supplier_id && !signed_file) {
        return null;
      }
      if (component.lotInfo.status == 8 && !signed_file) {
        return null;
      }

      var docpanel = Ext.apply({}, {
        bodyCssClass: 'subpanel',
        title: 'Протокол отказа от заключения договора',
        items: [],
        buttons: []
      }, component.stagePanel);

      if ((Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.repudiation)>0)) {
        docpanel.items.push({
          xtype: 'panel',
          border: false,
          frame: true,
          title: 'Протокол отказа',
          items: [{
            xtype: 'ux.contractlist',
            hideEds: true,
            //hide_date_added_col: true,
            //hide_last_version_col: true,
            files: component.files,
            filesFilter: {type_id: Application.models.Contract.FILE_TYPE.repudiation}
          }]
        });
      }

      if (!signed_file) {
        if (draft_file) {
          button = {
            text: 'Подписать протокол отказа',
            disabled: false,
            handler: function() {
              var sign_window = null;
              if (component.sign_window_id) {
                sign_window = Ext.getCmp(component.sign_window_id);
              }
              if (!sign_window) {
                component.sign_window_id = Ext.id();
                var sign_action_items = getSignActionItems('customer');
                sign_action_items.push({
                  xtype: 'hidden',
                  name: 'repudiation_id',
                  value: draft_file.id
                });
                var win = new Application.components.promptWindow({
                  title: 'Подписание договора',
                  cmpType: 'Application.components.SignatureForm',
                  parentCmp: this,
                  id: component.sign_window_id,
                  cmpParams: {
                    api: RPC.Contract.signrepudiation,
                    signatureText : makeTextRepudiation(draft_file.hash),
                    signatureTextHeight: 250,
                    useFormHandler: false,
                    items: sign_action_items,
                    success_fn: function(resp) {
                      win.close();
                      if (resp.finalized) {
                        Ext.MessageBox.alert('Заключение договора', 'Заказчик отказался от заключения договора, лот отправлен в архив');
                        redirect_to('com/procedure/index/type/archive');
                      } else {
                        Application.models.Contract.redirectToContract(component.currentCustomer, resp.currentSupplier, 'com/contract/index/lot/' + component.lot_id);
                      }
                    }
                  }
                });
                win.show();
              }
            }
          };
          docpanel.buttons.push(button);
        }
        button = {
          text: 'Загрузить протокол отказа',
          disabled: false,
          handler: function() {
            component.win = new Ext.Window({
              autoHeight: true,
              width: 600,
              closeAction: 'close',
              modal: true,
              title: 'Файл отказа',
              items: [{
                width: '100%',
                border: false,
                autoheight: true,
                frame: true,
                items: [{
                  xtype: 'combo',
                  hiddenName: 'reason_id',
                  mode: 'local',
                  editable: false,
                  triggerAction: 'all',
                  fieldLabel: 'Основание отказа',
                  store: [
                    [1, 'Участник уклонился от заключения договора'],
                    [2, 'Иное']
                  ],
                  value: 1
                }],
                params: {
                  'id': component.lotInfo.id,
                  'currentCustomer': component.currentCustomer,
                  'currentSupplier': component.currentSupplier,
                  'type_id': Application.models.Contract.FILE_TYPE.repudiation
                },
                fileUpload: true,
                xtype: 'Application.components.uploadContractForm',
                componentParent: component,
                filePanelId: 'upload-draft-form',
                labelWidth: 150,
                parentWin: component
              }]
            });
            component.win.show();
          }
        }

        docpanel.buttons.push(button);
      }
      return docpanel;
    }

    // Панель прочих документов поставщика
    function getSupplierOthersPanel() {
      var button, other_files_count, is_current_supplier;

      other_files_count = Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.supplier_other);
      is_current_supplier = (component.currentSupplier == Main.user.contragent_id);

      if (!component.currentContract.agreed) {
        return null;
      }
      if (!is_current_supplier && !other_files_count) {
        return null;
      }
      if (component.lotInfo.status == 8 && !other_files_count) {
        return null;
      }

      var docpanel = Ext.apply({}, {
        bodyCssClass: 'subpanel',
        title: 'Прочие документы заявителя',
        html: (is_current_supplier ? '<div class="normal-text" style="text-align: center; font-size: 12px;">Вы можете опубликовать здесь любые документы, затребованные заказчиком для заключения договора</div>' : null),
        items: [],
        buttons: []
      }, component.stagePanel);

      if (other_files_count>0) {
        docpanel.items.push({
          xtype: 'panel',
          border: false,
          frame: true,
          title: 'Документы',
          style: 'margin-bottom: 10px;',
          items: [{
            xtype: 'ux.contractlist',
            hideEds: true,
            hide_date_added_col: true,
            hide_last_version_col: true,
            files: component.files,
            filesFilter: {type_id: Application.models.Contract.FILE_TYPE.supplier_other}
          }]
        });
      }

      if (is_current_supplier) {
        button = {
          text: 'Загрузить документ',
          disabled: false,
          handler: function() {
            component.win = new Ext.Window({
              autoHeight: true,
              width: 600,
              closeAction: 'close',
              modal: true,
              title: 'Файл',
              items: [{
                width: '100%',
                border: false,
                autoheight: true,
                frame: true,
                params: {
                  'id': component.lotInfo.id,
                  'currentCustomer': component.currentCustomer,
                  'currentSupplier': component.currentSupplier,
                  'type_id': Application.models.Contract.FILE_TYPE.supplier_other
                },
                fileUpload: true,
                xtype: 'Application.components.uploadContractForm',
                componentParent: component,
                filePanelId: 'upload-draft-form',
                labelWidth: 150,
                parentWin: component
              }]
            });
            component.win.show();
          }
        }

        docpanel.buttons.push(button);
      }
      return docpanel;
    }

    function getOtherFilesPanel() {
      if (Application.models.Contract.filesCount(Application.models.Contract.FILE_TYPE.other)>0) {
        return Ext.apply({}, {
          xtype: 'fieldset',
          title: 'Иные файлы',
          hidden: (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.other)>0 ? false : true),
          items: {
            xtype: 'ux.contractlist',
            files: component.files,
            hideEds: true,
            hide_date_added_col: true,
            filesFilter: {type_id: Application.models.Contract.FILE_TYPE.other}
          }
        }, component.stagePanel);
      }
      return null;
    }

    function saveRequirements(cb) {
      component.waitParams['wait_text'] = 'Сохраняем требования к договору';
      performRPCCall(RPC.Contract.saveCustomerRequirements,
        [{
          lot_id: component.lot_id,
          customer_id:component.currentCustomer,
          agreementRequired: component.agreementRequired,
          signatureRequired: component.signatureRequired
        }], component.waitParams, function(resp) {
          //смотрим что дальше делать. если все подписано/не надо подписывать - отправляем в архив
          component.remove('contractInfo');
          initPanel[component.mode]();
          component.add(component.contractInfo);
          component.doLayout();
          redirectToArchiveIdFinalized(resp, 'Договор не нуждается в согласовании, лот отправлен в архив');
          if (cb) {
            cb();
          }
        }
      );
    }

    var initUploadButtons = function(type) {
      var result_buttons = [];
      if (type == 'customer') {
        if (!component.currentContract.agreed && component.currentCustomer == Main.user.contragent_id) {
          var text = 'новый проект договора';
          var uploadTitle = 'проекта договора';
          if (2==component.signatureRequired) {
            text = 'отсканированный подписанный договор';
            uploadTitle = 'подписанного договора';
          }
          result_buttons.push({
            text: 'Загрузить '+text,
            disabled: false,
            handler: function() {
              component.win = new Ext.Window({
                autoHeight: true,
                width: 600,
                closeAction: 'close',
                modal: true,
                title: 'Файл '+uploadTitle,
                items: [{
                  width: '100%',
                  border: false,
                  autoheight: true,
                  frame: true,
                  params: {
                    'id': component.lotInfo.id,
                    'currentCustomer': component.currentCustomer,
                    'currentSupplier': component.currentSupplier,
                    'type_id': Application.models.Contract.FILE_TYPE.draft
                  },
                  fileUpload: true,
                  xtype: 'Application.components.uploadContractForm',
                  componentParent: component,
                  filePanelId: 'upload-draft-form',
                  labelWidth: 150,
                  parentWin: component
                }]
              });
              component.win.show();
            }
          });
          var confirmButtonHidden = (!component.currentContract.customerSigned
          && (component.currentContract.supplierSigned || 2==component.signatureRequired)
          && (component.currentContract.agreed || !component.agreementRequired)
          && Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0
          && component.signatureRequired
          && component.currentCustomer == Main.user.contragent_id);
            if (2 == component.signatureRequired){
              result_buttons.push({
              text:'Подтвердить заключение договора',
              hidden:confirmButtonHidden,
              handler:function (){
                var params = [{'lot_id': component.lotInfo.id}];
                component.waitParams['wait_text'] = 'Подтвердаем заключение договора в письменной форме.';
                performRPCCall(RPC.Lot.signConfirm, params, component.waitParams, function(resp){
                  confirmedAction(resp);
                });
              }
            });
          }
        }
      } else {
        if (!component.currentContract.agreed && component.agreementRequired === true
              && Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0) {
          result_buttons.push({
            text: 'Разместить новый протокол разногласий',
            handler: function() {
              component.win = new Ext.Window({
                autoHeight: true,
                width: 600,
                closeAction: 'close',
                modal: true,
                title: 'Файл протокола разногласий',
                items: [{
                  width: '100%',
                  border: false,
                  autoheight: true,
                  frame: true,
                  params: {
                    'id': component.lotInfo.id,
                    'currentCustomer': component.currentCustomer,
                    'currentSupplier': component.currentSupplier,
                    'type_id': Application.models.Contract.FILE_TYPE.discrepancy
                  },
                  fileUpload: true,
                  xtype: 'Application.components.uploadContractForm',
                  componentParent: component,
                  filePanelId: 'upload-discrepancy-form',
                  labelWidth: 150,
                  parentWin: component
                }]
              });
              component.win.show();
            }
          });
        }
      }
      return result_buttons;
    }

    var initUploadPanel = {
      Customer: function() {
        if(component.agreementRequired === null && component.signatureRequired === null && component.currentCustomer == Main.user.contragent_id) {
          var win = new Ext.Window({
            title: 'Заключение договора',
            modal: true,
            closable: false,
            plugins: [Ext.ux.plugins.LimitSize],
            applyLayout: true,
            width: 700,
            items: [{
              xtype: 'Application.components.ProcedureDecisionForm',
              name: 'decision',
              hideButtons: true,
              values: {
                lot: component.lotInfo,
                suppliers: component.suppliers,
                customers: component.customers,
                currency:  component.currency
              }
            }],
            buttons: [{
              text: 'Подтвердить',
              handler: function() {
                var v = {};
                collectComponentValues(win, v);
                component.agreementRequired = v.decision.agreementRequired;
                component.signatureRequired = v.decision.signatureRequired;
                saveRequirements(function(){
                  win.close();
                });
              }
            }, {
              text: 'Отмена',
              handler: function() {
                redirect_to('com/procedure/index');
                win.close();
              }
            }]
          });
          win.show();
          /*Ext.Msg.show({
            title: 'Заключение договора',
            msg: 'Хотите ли вы согласовать договор? (В случае отказа лот переместится в архив)',
            buttons: Ext.Msg.YESNO,
            closable: false,
            fn: function(b){
              component.agreementRequired = (b == 'yes');
              if ('yes' == b && !Main.config.contracts_load_only) {
                Ext.Msg.show({
                  title: 'Заключение договора',
                  msg: 'Хотите ли вы заключить договор в электронном виде?',
                  buttons: Ext.Msg.YESNO,
                  closable: false,
                  fn: function(b){
                    component.signatureRequired = ('yes' == b);
                    saveRequirements();
                  }
                }, this);
              } else {
                saveRequirements();
              }
            }
          }, this);*/
        }
        var result = [{
          xtype : 'ux.contractlist',
          id: 'upload-draft-form',
          hide_date_added_col: true,
          defaults: {
            anchor: '100%',
            stateful: true,
            allowBlank: false,
            frame: true
          },
          files: component.files,
          filesFilter: {type_id: Application.models.Contract.FILE_TYPE.draft},
          selectorName: 'unpublished_draft',
          hideEds: true
        }];
        return {
          xtype: 'panel',
          border: false,
          frame: true,
          title: (2==component.signatureRequired)?'Подписанные документы договора':'Проекты договора',
          hidden: (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0 ? false : true),
          items: result
        };
      },
      Supplier: function() {
        var result = {
          xtype: 'ux.contractlist',
          id: 'upload-discrepancy-form',
          hideEds: true,
          hide_date_added_col: true,
          files: component.files,
          filesFilter: {type_id: Application.models.Contract.FILE_TYPE.discrepancy}
        };
        return {
          xtype: 'panel',
          border: false,
          frame: true,
          title: 'Протоколы разногласий',
          hidden: (Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.discrepancy)>0 ? false : true),
          items: result
        };
      }
    }

    var initPanel = {
      View: function() {
        var stageCustomerLoaded = getCustomerLoadedPanel();
        var stageSupplierAgreed = getSupplierSignedPanel();
        var repudiationPanel = getCustomerRepudiationPanel();
        var supplierOthersPanel = getSupplierOthersPanel();

        component.contractInfo.items = [stageCustomerLoaded, stageSupplierAgreed];
        if (repudiationPanel) {
          component.contractInfo.items.push(repudiationPanel);
        }
        if (supplierOthersPanel) {
          component.contractInfo.items.push(supplierOthersPanel);
        }
        var otherFilesPanel = getOtherFilesPanel(component.files, component.stagePanel);

        if (otherFilesPanel) {
          component.contractInfo.items.push(otherFilesPanel);
        }
      },
      Admin: function() {
        initPanel['View']();
      },
      Customer: function() {
        component.uploadPanelId = Ext.id();
        var fieldset_title = 'Стадия согласования проекта договора с заказчиком';
        if (2==component.signatureRequired) {
          fieldset_title = 'Подтверждение заключения договора';
        }
        if (component.currentContract.agreed && component.lotInfo.status == 7 && component.signatureRequired) {
          fieldset_title = 'Стадия подписи проекта договора заказчиком';
        }
        if (component.lotInfo.status == 8) {
          fieldset_title = 'Договор, подписанный уполномоченным представителем заказчика';
        }
        var stageDraft = Ext.apply({}, {
          title: fieldset_title,
          id: component.uploadPanelId,
          bodyCssClass: 'subpanel',
          items: [],
          buttons: []
        }, component.stagePanel);

        if (component.agreementRequired === false && 2!=component.signatureRequired) {
          stageDraft.items.push(component.agreedNotNeededPanel);
        }

        stageDraft.items.push(initUploadPanel['Customer']());
        if (2==component.signatureRequired) {
          //stageDraft.items.push(generateInfoPanel('В случае выбора письменной формы заключения договора, Вам необходимо опубликовать подписанный договор, тем самым подтвердить его заключение, после чего процедура будет направлена в архив и денежные средства у участников разблокируются. В случае уклонение участника от заключения договора, Вам необходимо отказаться от данного участника и выбрать основание отказа в отношении данного участника «Уклонился от заключения договора»'));
          stageDraft.items.push(generateInfoPanel('В случае выбора письменной формы заключения договора, Вам необходимо подтвердить заключение договора, после чего процедура будет направлена в архив и денежные средства у участников разблокируются. В случае уклонения участника от заключения договора, Вам необходимо отказаться от данного участника и выбрать основание отказа в отношении данного участника "Уклонился от заключения договора", денежные средства уклониста останутся заблокированными. В случае отказа от заключения договора с основанием «Иное», денежные средства у победителя разблокируются.'));//vplasshykhin ETPSUPA-190
        }
        stageDraft.buttons.push(initUploadButtons('customer'));

        if (component.currentContract.customerSigned) {
          var date_customer_eds = '';
          if (component.currentContract.date_customer_eds) {
            date_customer_eds = ', ' + Ext.util.Format.localDateText(parseDate(component.currentContract.date_customer_eds));
          }
          var confirm_text = 'Проект договора подписан заказчиком';
          if (2==component.signatureRequired) {
            confirm_text = 'Заключение договора подтверждено';
          }
          stageDraft.items.push(generateInfoPanel(confirm_text+date_customer_eds+'.', true, 'customer'));
        }
        if (!component.currentContract.customerSigned
          && (component.currentContract.supplierSigned || 2==component.signatureRequired)
          && (component.currentContract.agreed || !component.agreementRequired)
          && Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)>0
          && component.signatureRequired
          && component.currentCustomer == Main.user.contragent_id) {

          stageDraft.items.push({
            xtype: 'fieldset',
            frame: false,
            border: true,
            buttonAlign: 'center',
            style: 'margin-top: 10px; margin-bottom: 0px; padding: 10px 0 7px',
            buttons: [{
              text: 'Подписать',
              handler: function() {
                component.fireEvent('customerSigned');
              }
            }]
          });
        }
        /*
        if (component.currentContract.agreed
          && !component.signatureRequired
          && component.currentCustomer == Main.user.contragent_id) {
          stageDraft.items.push({
            xtype: 'fieldset',
            frame: false,
            border: true,
            buttonAlign: 'center',
            style: 'margin-top: 10px; margin-bottom: 0px; padding: 10px 0 7px',
            buttons: [{
              text: 'Подтвердить заключение договора в бумажной форме',
              handler: function() {
                component.fireEvent('agreementApproved');
              }
            }]
          });
        }*/

        var repudiationPanel = getCustomerRepudiationPanel();
        var supplierOthersPanel = getSupplierOthersPanel();
        component.contractInfo.items = [stageDraft, getSupplierSignedPanel()];
        if (repudiationPanel) {
          component.contractInfo.items.push(repudiationPanel);
        }
        if (supplierOthersPanel) {
          component.contractInfo.items.push(supplierOthersPanel);
        }
        var otherFilesPanel = getOtherFilesPanel();

        if (otherFilesPanel) {
          component.contractInfo.items.push(otherFilesPanel);
        }
      },
      Supplier: function() {
        component.uploadPanelId = Ext.id();
        var fieldset_title = 'Стадия согласования проекта договора c заявителем';
        if (component.currentContract.agreed && component.lotInfo.status == 7
            && component.signatureRequired && 2!=component.signatureRequired) {
          fieldset_title = 'Стадия подписи проекта договора заявителем';
        }
        if (component.lotInfo.status == 8) {
          fieldset_title = 'Договор, подписанный уполномоченным представителем заявителя';
        }
        var stageSupplierSign = Ext.apply({}, {
          title: fieldset_title,
          id: component.uploadPanelId,
          items: [],
          buttons: []
        }, component.stagePanel);

        stageSupplierSign.items = [];
        if (component.lotInfo.contract_supplier_id == component.currentSupplier) {
          if (component.currentContract.supplierSigned) {
            var date_supplier_eds = '';
            if (component.currentContract.date_supplier_eds) {
              date_supplier_eds = ', ' + Ext.util.Format.localDateText(parseDate(component.currentContract.date_supplier_eds));
            }
            stageSupplierSign.items.push(generateInfoPanel('Проект договора подписан заявителем'+date_supplier_eds+'.', false, 'supplier'));
          } else {
            if (component.currentContract.agreed) {
              if (!component.supplierRefusedSign) {
                stageSupplierSign.items.push(component.agreedPanel);
              } else {
                stageSupplierSign.items.push(generateInfoPanel('Заявитель согласен с проектом договора, но отказался от заключения договора в электронном виде.'));
              }
            } else if (component.agreementRequired) {
              if (component.currentContract.id) {
                stageSupplierSign.items.push(component.notAgreedPanel);
              }
              if (component.lotInfo.status == 7
                && Application.models.Contract.filesCount(component.files, Application.models.Contract.FILE_TYPE.draft)==0) {
                  stageSupplierSign.items.push(generateInfoPanel(component.wait_customer_requirements_text));
              }
            }
            if (!component.currentContract.supplierSigned
              && component.currentContract.agreed
              && component.signatureRequired
              && 2!=component.signatureRequired
              && !component.supplierRefusedSign) {
              var supplier_last_sign_date = Ext.util.Format.localDateOnlyRenderer(parseDate(component.currentContract.date_agreed_end, 'c')); //.add(Date.DAY, 7));
              var supplier_last_sign_date_html = 'Крайний срок подписания заявителем: ' + supplier_last_sign_date;
              var is_supplier_can_sign = isSupplierCanSign();
              if (!is_supplier_can_sign) {
                supplier_last_sign_date_html = 'Крайний срок подписания заявителем ' + supplier_last_sign_date + ' истек.';
              }
              stageSupplierSign.items.push({
                xtype: 'fieldset',
                frame: false,
                border: true,
                buttonAlign: 'center',
                style: 'padding: 10px 0 7px;',
                html: '<div class="normal-text" style="text-align: center; font-size: 12px;">' + supplier_last_sign_date_html + '</div>',
                buttons: [{
                  text: 'Подписать',
                  hidden: !is_supplier_can_sign,
                  handler: function() {
                    component.fireEvent('supplierSigned');
                  }
                }]
              });
            }
          }
        } else {
          stageSupplierSign.items.push(generateInfoPanel('Договор с участником не заключается.'));
        }

        stageSupplierSign.items.push(initUploadPanel['Supplier']());
        if (component.lotInfo.contract_supplier_id == component.currentSupplier) {
          stageSupplierSign.buttons = initUploadButtons('supplier');
        }
        var stageCustomerLoaded = getCustomerLoadedPanel();
        var otherFilesPanel = getOtherFilesPanel();
        var repudiationPanel = getCustomerRepudiationPanel();
        var supplierOthersPanel = getSupplierOthersPanel();

        component.contractInfo.items = [stageCustomerLoaded];
        var need_supplier_panel = false;
        for (var i=0; i<stageSupplierSign.items.length; i++) {
          if (!stageSupplierSign.items[i].hidden) {
            need_supplier_panel=true;
            break;
          }
        }
        if (!need_supplier_panel && stageSupplierSign.buttons.length) {
          need_supplier_panel = true;
        }
        if (need_supplier_panel) {
          component.contractInfo.items.push(stageSupplierSign);
        }

        if (repudiationPanel) {
          component.contractInfo.items.push(repudiationPanel);
        }
        if (supplierOthersPanel) {
          component.contractInfo.items.push(supplierOthersPanel);
        }
        if (otherFilesPanel) {
          component.contractInfo.items.push(otherFilesPanel);
        }
      }
    }

    function redirectToArchiveIdFinalized(resp, message) {
      if (resp.finalized) {
        Ext.MessageBox.alert('Заключение договора', message);
        redirect_to('com/procedure/index/type/archive');
      }
    }
    
    function confirmedAction(resp) {
      component.lotInfo = resp.lotInfo;
      var msg = 'Заключение договора в письменной форме подтверждено, лот отправлен в архив.';
      redirectToArchiveIdFinalized(resp, msg);
    }

    function signedAction(win, resp) {
      win.close();
      component.remove('contractInfo');
      component.lotInfo = resp.lotInfo;
      setCurrentContract(resp.currentContract);
      initPanel[component.mode]();
      component.add(component.contractInfo);
      component.doLayout();
      var msg = 'Договор подписан всеми участниками, лот отправлен в архив';
      if (resp.warning) {
        if (resp.finalized) {
          msg += ' (Предупреждение: '+msg+')';
        } else {
          Ext.MessageBox.alert('Предупреждение', msg);
        }
      }
      redirectToArchiveIdFinalized(resp, msg);
    }

    function getSignActionItems(type) {
      return [{
          xtype: 'hidden',
          name: 'lot_id',
          value: component.lot_id
        }, {
          xtype: 'hidden',
          name: 'contract_id',
          value: component.currentContract.id
        }, {
          xtype: 'hidden',
          name: 'type',
          value: type
        }, {
          xtype: 'hidden',
          name: 'signDate',
          value: component.signDate
        }
      ];
    }
    var waitId = Ext.id();
    Ext.apply(this, {
      items: [{
          id: waitId,
          html: '<div style="height: 100px; text-align: center; padding-top: 45px;">Пожалуйста, подождите</div>'
      }],
      listeners: {
        reload: function(id) {
          if (component.win) {
            component.win.close();
          }
          performRPCCall(RPC.Contract.loadFiles, [{lot_id: component.lot_id, customer_id: component.customer_id, supplier_id: component.supplier_id}], component.waitParams, function(resp) {
            component.remove(waitId);
            component.files = resp.files;

            setCurrentContract(resp.currentContract);

            component.remove('contractInfo');
            initPanel[component.mode]();
            component.add(component.contractInfo);
            component.doLayout();
          });
        },
        agreed: function() {
          component.waitParams['wait_text'] = 'Сохраняем согласование';
          performRPCCall(RPC.Contract.contractAgreed, [{lot_id: component.lot_id, contract_id: component.currentContract.id}], component.waitParams, function(resp) {
            component.remove('contractInfo');
            component.lotInfo = resp.lotInfo;
            setCurrentContract(resp.currentContract);
            initPanel['Supplier']();
            component.add(component.contractInfo);
            component.doLayout();
            echoResponseMessage(resp);
            redirectToArchiveIdFinalized(resp, 'Договор согласован со всеми участниками, лот отправлен в архив');
          });
        },
        agreementApproved: function() {
          component.waitParams['wait_text'] = 'подтверждаем';
          performRPCCall(RPC.Contract.agreementApproved, [{lot_id: component.lot_id, contract_id: component.currentContract.id}], component.waitParams, function(resp) {
            component.remove('contractInfo');
            component.lotInfo = resp.lotInfo;
            setCurrentContract(resp.currentContract);
            initPanel['Customer']();
            component.add(component.contractInfo);
            component.doLayout();
            echoResponseMessage(resp);
            redirectToArchiveIdFinalized(resp, 'Заключение договора подтверждено, лот отправлен в архив');
          });
        },
        customerSigned: function() {
          component.waitParams['wait_text'] = 'подписываем';
          var sign_window = null;
          if (component.sign_window_id) {
            sign_window = Ext.getCmp(component.sign_window_id);
          } 
          if (!sign_window) {
            component.sign_window_id = Ext.id();
            var win = new Application.components.promptWindow({
              title: 'Подписание договора',
              cmpType: 'Application.components.SignatureForm',
              parentCmp: this,
              id: component.sign_window_id,
              cmpParams: {
                api: RPC.Contract.sign,
                signatureText : makeText('заказчиком'),
                signatureTextHeight: 250,
                useFormHandler: false,
                items: getSignActionItems('customer'),
                success_fn: function(resp) {
                  signedAction(win, resp);
                }
              }
            });
            win.show();
          }
        },
        supplierSigned: function() {
          component.waitParams['wait_text'] = 'подписываем';
          var sign_window = null;
          if (component.sign_window_id) {
            sign_window = Ext.getCmp(component.sign_window_id);
          }
          if (!sign_window) {
            component.sign_window_id = Ext.id();
            var win = new Application.components.promptWindow({
              title: 'Подписание договора',
              cmpType: 'Application.components.SignatureForm',
              parentCmp: this,
              id: component.sign_window_id,
              cmpParams: {
                api: RPC.Contract.sign,
                signatureText : makeText('заявителем'),
                signatureTextHeight: 250,
                useFormHandler: false,
                items: getSignActionItems('supplier'),
                success_fn: function(resp) {
                  signedAction(win, resp);
                }
              }
            });
            win.show();
          }
        }
      }
    });

    Application.components.ContractListPanel.superclass.initComponent.call(this);

    performRPCCall(RPC.Contract.load, [{lot_id: component.lot_id, customer_id: component.customer_id, supplier_id: component.supplier_id}], component.waitParams, function(resp) {
      if (resp.finalized === true) {
        Ext.MessageBox.alert('Заключение договора', resp.message, function() {
          redirect_to('com/procedure/index/type/archive');
        });
        return;
      }
      component.remove(waitId);
      var fieldsToFill = ['mode', 'lotInfo', 'files', 'currentSupplier',
        'currentCustomer', 'suppliers', 'customers', 'currentContract',
        'agreementRequired', 'signatureRequired', 'supplierRefusedSign',
        'participants_eds_info', 'currency'
      ];

      for (var i = 0; i < fieldsToFill.length; i++) {
        component[fieldsToFill[i]] = resp[fieldsToFill[i]];
      }
      if (!component.currentContract) {
        component.currentContract = {'agreed':false, 'id': null};
      }
      initPanel[component.mode]();
      if (resp.lotInfo.status == 8) {
        if (resp.contract_eds_text) {
          component.lotInfoButtons.push({
            text: 'Открыть сведения о подписанном договоре',
            handler: function(){
              Application.models.Contract.showContractEds(resp.contract_eds_text);
            }
          });
        }
        component.lotInfoButtons.push({
          text: 'Реквизиты участника',
          hidden: component.suppliers.length == 0,//bug-avtodor-110
          handler: function(){
            Application.models.Contract.showSupplierRecs(component.currentSupplier, component.suppliers);
          }
        });
      }

      var lot_data = {
        'lot': resp.lotInfo,
        'suppliers': resp.suppliers,
        'customers': resp.customers,
        'current_customer': resp.currentCustomer,
        'current_supplier': resp.currentSupplier,
        'currency': resp.currency,
        'agreement_required': resp.agreementRequired,
        'signature_required': resp.signatureRequired
      };
      component.add(/*{
        xtype: 'fieldset',
        defaults: {
          anchor: '100%',
          stateful: true,
          allowBlank: false,
          frame: true
        },
        title: 'Информация о лоте',
        items: Application.models.Contract.renderLotInfo(lot_data),
        buttonAlign: 'center',
        buttons: component.lotInfoButtons
      }*/
      Application.models.Contract.renderLotInfo(lot_data),
      {
        xtype: 'fieldset',
        defaults: {
          anchor: '100%',
          stateful: true,
          allowBlank: false,
          frame: true
        },
        title: 'Информация о договаривающихся сторонах',
        items: Application.models.Contract.renderParticipants(lot_data),
        buttons: component.lotInfoButtons
      }, component.contractInfo);
      component.doLayout();
    });
  }
});
