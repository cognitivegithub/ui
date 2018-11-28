Application.components.LoadEdsForm = Ext.extend(Ext.Panel, {
    frame : true,
    initComponent : function () {
        var component = this;
        Ext.apply(this, {
            bodyCssClass: 'subpanel',
            bodyStyle: 'padding-top: 5px;',
            items: {
                xtype: 'fieldset',
                title: 'Пожалуйста, обновите данные своего сертификата, нажав на кнопку ниже',
                buttonAlign: 'center',
                style: 'margin-bottom: 5px;',
                buttons: [{
                    text: 'Загрузить ЭЦП',
                    handler: function() {
                        var string = gettime();

                        var newCertificate = function(signature) {
                            performRPCCall(RPC.User.newcertificate, [{signature : signature, user_id: component.user_id}], null, function(resp) {
                                if (resp && resp.success && resp.user_full_name) {
                                    Main.user.full_name = resp.user_full_name;
                                    Main.app.fireEvent('deposit_changed', Main.contragent);
                                }
                                echoResponseMessage(resp);
                            });
                        };

                        if (Main.signaturePlugin == 'capicom') {
                            var signatureValue = signData(string,1,1);
                            if(signatureValue.charAt(0)!='!' && signatureValue!='') {
                                newCertificate(signatureValue);
                            } else {
                                if (signatureValue != '') Ext.MessageBox.alert('Ошибка', signatureValue.substr(1));
                            }
                        }
                        else if (Main.signaturePlugin == 'cryptopro') {
                            CryptoPlugin.signMessage({
                                message: string,
                                success: function(response) {
                                    if (!checkSignatureResult(string)) {
                                        return false;
                                    }
                                    newCertificate(response.message_signed);
                                },
                                failure: function(response) {
                                    var oCert = response.certificate;
                                    var message = '<span style="color:red;">Ошибка при загрузке подписи</span>';
                                    message += component.getCertInfo(oCert);
                                    Ext.MessageBox.alert('Ошибка', message);
                                }
                            });
                        }
                        return false;
                    }
                }]
            }
        });
        Application.components.LoadEdsForm.superclass.initComponent.call(this);
    }
});