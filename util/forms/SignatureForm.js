/**
 * Форма с текстовым полем для подписи. Позволяет подписать заданный текст ЭПой.
 *
 * Параметры:
 *   items - массив дополнительных полей (если требуется что-то, кроме текста для подписи)
 *   buttons - массив доп. кнопок
 *   title - заголовок формы
 *   signatureText - значение для текстового поля
 *   signatureTextHeight - высота текстового поля
 *   signatureButtonText - текст кнопки, по умолчанию Подписать
 *   success_fn - метод, вызываемый после успешного подписания
 *   backUrl - куда отправлять по кнопке "назад"
 *   showFieldset - оборачивать ли айтемы в филдсет
 *   isWriteable - можно ли редактировать содержимое текста
 *
 */
Application.components.SignatureForm = Ext.extend(Ext.form.FormPanel, {
    frame : false,
    border : false,
    useFormHandler: true,
    forceEds: false,
    noeds: false,
    signName: this.signatureTextName||'signature_text',
    signAllowBlank: this.signatureAllowBlank === undefined ? true : this.signatureAllowBlank,
    isAutoSign: false,
    id: 'signature_form',
    signButtonId: this.signButtonIdent || Ext.id(),
    initComponent : function () {
        var component = this;
        component.signName = this.signatureTextName||'signature_text';
        component.signAllowBlank = this.signatureAllowBlank === undefined ? true : this.signatureAllowBlank;
        component.signButtonId = this.signButtonIdent || Ext.id();
        var hideSignatureData = component.hideSignatureData||false;
        component.defaultLayout = component.defaultLayout||'anchor';
        component.showFieldset = component.showFieldset||false;
        component.labelWidth = component.labelWidth||200;
        component.isWriteable = component.isWriteable||false;
        component.signatureButtonText = component.signatureButtonText || Translate._('Подписать');

        this.addEvents('dataSelected');
        this.addEvents('hideSignData');
        this.addEvents('showSignData');

        var items = [];
        if (undefined !== this.items) {
            if (Ext.isArray(this.items)) {
                items.push.apply(items, this.items);
            } else {
                items.push(this.items);
            }
        }
        items.push({
            xtype: 'textarea',
            style: 'margin: 5px 5px 2px',
            name: this.signName,
            id: this.signName,
            fieldLabel: t('Внимательно перечитайте и проверьте подписываемые данные'),
            hidden: hideSignatureData,
            height: this.signatureTextHeight ? this.signatureTextHeight : 600,
            readOnly: !component.isWriteable,
            value: this.signatureText,
            allowBlank: this.signAllowBlank,
            blankText: this.signAllowBlank ? null : 'Поле обязательно для заполнения'
        }, {
            xtype: 'hidden',
            name: 'signature'
        }, {
            xtype: 'hidden',
            name: 'perform_step_move',
            id: 'perform_step_move'
        });

        if (component.showFieldset) {
            var showItems = new Ext.form.FieldSet({
                style: 'padding: 12px 10px 10px 10px;',
                defaults: {
                    blankText: 'Поле обязательно для заполнения',
                    allowBlank: false,
                    xtype: 'textfield',
                    anchor: '100%'
                }, items: items });
        } else {
            showItems = items;
        }
        var buttons = [];
        if (undefined !== this.buttons) {
            if (Ext.isArray(this.buttons)) {
                buttons.push.apply(buttons, this.buttons);
            } else {
                buttons.push(this.buttons);
            }
        }
        buttons.push({
                ref: '../buttonBack',
                text: 'Назад',
                hidden: component.backUrl ? false : true,
                handler: function() {
                    redirect_to(component.backUrl);
                },
                scope: this
            },
            {
                ref: '../buttonSign',
                text: component.signatureButtonText,
                scope: this,
                formBind : true,
                id: this.signButtonId,
                hidden: hideSignatureData,
                handler: function(){
                    component.signForm(this, component.signName, component.success_fn);
                }
            });
        if (component.extraButtons && Main.config.show_more_signature_buttons) {
            buttons.push([
                {
                    xtype: 'button',
                    text: 'Утвердить и создать новую закупку',
                    formBind : true,
                    scope: this,
                    handler: function(){
                        component.signForm(this, component.signName, function() {
                            redirect_to('po/procedure/new');
                        });
                    }
                },
                {
                    xtype: 'button',
                    text: 'Сформировать выписку руководителю',
                    formBind: true,
                    scope: this,
                    pseudo: 'to_formed',
                    handler: function () {
                        var procId = this.getForm().findField('procedure_id').getValue();
                        component.signForm(this, component.signName, function() {
                            Application.models.Po_Procedure.shiftSteps([procId], 1,
                                function() {
                                    if (procId) {
                                        window.open('/po/report/toSupervisorReport/ids/' + procId);
                                    }
                                });
                            redirect_to('po/procedure/my');
                        });
                    }
                }
            ]);
        }

        Ext.apply(this, {
                title: component.title ? component.title: t('Внимательно перечитайте и проверьте подписываемые данные'),
                labelWidth: component.labelWidth,
                frame: true,
                autoScroll: true,
                fileUpload: true,
                layout: component.defaultLayout,
                defaults: {
                    anchor : '100%'
                },
                items : showItems,
                buttons: buttons,
                listeners : {
                    dataSelected: function(flag) {
                        Ext.getCmp(this.signButtonId).setDisabled(flag);
                    },
                    hideSignData: function() {
                        Ext.getCmp(this.signButtonId).hide();
                        Ext.getCmp(this.signName).hide();
                    },
                    showSignData: function(signText) {
                        Ext.getCmp(this.signButtonId).show();
                        var s = Ext.getCmp(this.signName);
                        s.show();
                        s.setValue(signText);
                    },
                    afterrender: function() {
                        var form = this;
                        var additional = form.additional||[];

                        if(additional.length) {
                            var i=0;
                            while(i<additional.length) {
                                var fld = additional[i];
                                var hiddenField = {
                                    xtype: 'hidden',
                                    name: fld.nm,
                                    value: fld.val
                                };
                                form.add(hiddenField);
                                i++;
                            }
                        }
                    }
                }
            }
        );
        Application.components.SignatureForm.superclass.initComponent.call(this);

        this.form.api = {
            submit: this.api
        };
        this.form.waitMsgTarget = true;

        if (this.isAutoSign) {
            this.addListener('procedureInfoLoad', function (signPanel) {
                var buttonSign = signPanel.buttonSign;
                buttonSign.el.dom.click();
            }, this);
        }
    },
    signForm: function (form, signField, success_fn) {
        var component = this;
        var formValues = form.getForm().getValues();
        var sign_text = formValues[signField];
        var signatureValue = false;
    
        var onSuccess = function (resp) {
            if (Main.config.save_is_only_information_message && resp.success) {
                Ext.Msg.show({
                    title: t(resp.title || 'Документы и сведения направлены успешно'),
                    msg: t(resp.message || resp.msg),
                    icon: Ext.MessageBox.INFO
                });
                (function () {
                    Ext.MessageBox.hide();
                }).defer(2000);
            } else {
                echoResponseMessage(resp);
            }
            if (!resp.success && (!resp.result || !resp.result.success)) {
                return;
            }
            if (resp.reloadPrivileges || (resp.result && resp.result.reloadPrivileges)) {
                Main.reloadPrivileges();
            }
            if (success_fn) {
                success_fn(resp);
            } else if (resp.redirect_url) {
                redirect_to(resp.redirect_url);
            } else if (resp.result.redirect_url) {
                redirect_to(resp.result.redirect_url);
            }
        };
    
        if (Main.signaturePlugin == 'capicom') {
            if ((Main.eds.mode == 'none' && !component.forceEds) || component.noeds) {
                signatureValue = 'a';
            } else {
                signatureValue = signData(formValues[signField], 1);
                if (!checkSignatureResult(signatureValue)) {
                    return false;
                }
            }
            var acceptResponse = function (signatureValue, form, formValues) {
                if (component.useFormHandler) {
                    form.getForm().findField('signature').setValue(signatureValue);
                    if (form.getForm().isValid()) {
                        form.getForm().submit({
                            waitMsg: 'Отправляем данные',
                            success: function (form, result) {
                                onSuccess(result);
                            },
                            failure: function (form, resp) {
                                if (resp && resp.result && resp.result.message) {
                                    echoResponseMessage(resp);
                                }
                            }
                        });
                    } else {
                        Ext.Msg.alert('Ошибка', 'Не заполнены обязательные поля');
                    }
                } else {
                    formValues.signature = signatureValue;
                    formValues.perform_step_move = Ext.getCmp('perform_step_move').getValue();
                    var params = {
                        mask: true,
                        wait_text: 'Осуществляем подпись...'
                    };
                    performRPCCall(form.api, [formValues], params, function (result) {
                        onSuccess(result);
                    });
                }
            };
    
            if (window.Main && Main.eds && (Main.eds.mode == 'none' || (isCustomer() && !Main.eds.crypt_customer)
              || (isSupplier() && !Main.eds.crypt_supplier))) {
                signatureValue = 'null signature: ' + sign_text;
                acceptResponse(signatureValue, form, formValues);
                return true;
            }
    
        } else if (Main.signaturePlugin == 'cryptopro') {
            if ((Main.eds.mode == 'none' && !component.forceEds) || component.noeds) {
                signatureValue = 'a';
            } else {
                CryptoPlugin.signMessage({
                    message: formValues[signField],
                    success: function (response) {
                        if (!checkSignatureResult(formValues[signField])) {
                            return false;
                        }
                        signatureValue = response.message_signed;
                        if (component.useFormHandler) {
                            form.getForm().findField('signature').setValue(signatureValue);
                            if (form.getForm().isValid()) {
                                form.getForm().submit({
                                    waitMsg: 'Отправляем данные',
                                    success: function (form, result) {
                                        onSuccess(result);
                                    },
                                    failure: function (form, resp) {
                                        if (resp && resp.result && resp.result.message) {
                                            echoResponseMessage(resp);
                                        }
                                    }
                                });
                            } else {
                                Ext.Msg.alert('Ошибка', 'Не заполнены обязательные поля');
                            }
                        } else {
                            formValues.signature = signatureValue;
                            var params = {
                                mask: true,
                                wait_text: 'Осуществляем подпись...'
                            };
                            performRPCCall(form.api, [formValues], params, function (result) {
                                onSuccess(result);
                            });
                        }
                        return false;
                    },
                    failure: function (result) {
                        var signatureValue = result.message;
    
                        Ext.MessageBox.alert('Ошибка', signatureValue.substr(1));
                        return false;
                    }
                });
            }
        } else {
            signatureValue = 'a';
        }
        if (signatureValue == 'a') {
            if (component.useFormHandler) {
                form.getForm().findField('signature').setValue(signatureValue);
                if (form.getForm().isValid()) {
                    form.getForm().submit({
                        waitMsg: 'Отправляем данные',
                        success: function (form, result) {
                            onSuccess(result);
                        },
                        failure: function (form, resp) {
                            if (resp && resp.result && resp.result.message) {
                                echoResponseMessage(resp);
                            }
                        }
                    });
                } else {
                    Ext.Msg.alert('Ошибка', 'Не заполнены обязательные поля');
                }
            } else {
                formValues.signature = signatureValue;
                var params = {
                    mask: true,
                    wait_text: 'Осуществляем подпись...'
                };
                performRPCCall(form.api, [formValues], params, function (result) {
                    onSuccess(result);
                });
            }
        }
    },
    addExtraButtons: function () {
    var component = this;
    if (!this.extraAdded) {
      this.addButton({
        xtype: 'button',
        text: 'Направить и создать новую потребность',
        formBind: true
      }, function () {
        this.signForm(this, component.signName, function () {
          redirect_to('po/procedure/new');
        });
      }, this);
      this.addButton({
        xtype: 'button',
        text: 'Сформировать выписку руководителю',
        formBind: true,
        hidden: true,
        pseudo: 'to_formed'
      }, function () {
        var procId = this.getForm().findField('procedure_id').getValue();
        this.signForm(this, component.signName, function (response) {
          var getReportFunction = function () {
            if (procId) {
              var url = '/po/report/toSupervisorReport/ids/' + procId;
              var display = {
                download: true, wait_disable: true
              };
              var params = {};
              performAjaxRPCCall(url, params, display);
              redirect_to('po/procedure/my');
            }
          };
          if (!response.procedure_data.from_department_id) {
            Application.models.Po_Procedure.shiftSteps([procId], 1, getReportFunction)
          } else {
            getReportFunction()
          }
        });
      }, this);
    }
    this.extraAdded = true;
    this.doLayout();
  }
});
