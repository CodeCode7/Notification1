/** @author XNANSHA Date: 23/04/2019 */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(Component, Button, Bar, MessageToast, JSONModel) {

	return Component.extend("com.eric.pushnotifications.Component", {

		metadata: {
			"manifest": "json"
		},

		/**@desc this method contain logic for push notification enablment
		 */
		init: function() {
			var intCount = 0;
			var rendererPromise = this._getRenderer();
			var stringCount;
			var that = this;
		
			rendererPromise.then(function(oRenderer) {

					var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/Z_PUSH_NTF_SRV/", {
						json: true,
						loadMetadataAsync: true
					});

				//To read count of notification
				oModel.read("PUSH_NOTIFSet?$filter=ReadFlg eq ''&$inlinecount=allpages&$format=json", {
					sync: false,
					success: function(oData, response) {
						stringCount = oData.results.length;
						if (!isNaN(stringCount)) {
							intCount = parseFloat(stringCount);
							//	console.log("intCount 1 " + intCount);

							// To add notification icon on FLP
							oRenderer.addHeaderEndItem(
								"sap.ushell.ui.shell.ShellHeadItem", {
									id: "notification",
									icon: "sap-icon://ui-notifications",
									//  icon: "sap-icon://message-popup",
									selected: false,
									floatingNumber: intCount,
									tooltip: "Notifications",
									press: function(oEvent) {
										var that1 = that;
										var oSource = oEvent.getSource();
										oSource.setSelected(true);
										//Code for Local JSONModel Call
										//  var oModel = new JSONModel(jQuery.sap.getModulePath("com.eric.pushnotification.model", "/Notification.json"));
										//  var oModel = new JSONModel(jQuery.sap.getModulePath("com.eric.pushnotification.model", "/PUSH_NOTIFSet.json"));
										//	console.log("model " + oModel);

										//Defining Controller for fregment actions 
										var oFrgmntController = {

											// This is when user clicked the View All Notification button in popover
											onPress: function(oEvent) {
												// get a handle on the global XAppNav service
												var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

												/*	oCrossAppNavigator.isIntentSupported(["ZPUSHNOTI_SEM-display"])
														.done(function(aResponses) {
															console.log("ZPUSHNOTI_SEM-display supported");
														})
														.fail(function() {
															new sap.m.MessageToast("Provide corresponding intent to navigate");
														});*/

												// generate the Hash
												var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
													target: {
														semanticObject: "ZPUSHNOTI_SEM",
														action: "display"
													}
												})) || "";
												//Generate a  URL for the second application
												//  var url = window.location.href.split('#')[0] + hash;
												//Navigate to second app
												//  sap.m.URLHelper.redirect(url, true);

												//navigation in FLP
												oCrossAppNavigator.toExternal({
													target: {
														shellHash: hash
													}
												});

											},

											//This is when user clicked the X button in notification List
											onItemClose: function(oEvent) {
												var oItem = oEvent.getSource(),
													oList = oItem.getParent();
													oList.removeItem(oItem);
											//	
											//	oList.refresh();
											//	oList.getBinding("items").refresh();
												
											//	that1.onUpdateOperation(oItem.getBindingContext());
												//  MessageToast.show("Item Closed: " + oEvent.getSource().getTitle());
											},

											//This is when user click on any notifications
											onListItemPress: function(oEvent) {
											
											
												var oItem = oEvent.getSource(),
													oList = oItem.getParent();
												//	oList.removeItem(oItem);
													//oList.getModel().updateBindings(true);
												//	oList.getBinding("items").refresh();
												
												
													that1.onPressOpenTask(oEvent);
												//	that1.onUpdateOperation(oEvent);
													
													
												//	this.onItemClose(oEvent);
												//that1.onNotificationCountRefresh();
												
												

											}

										};

										if (!this._oPopover) {
											this._oPopover = sap.ui.xmlfragment("com.eric.pushnotifications.fragments.NotificationList", oFrgmntController);
											//  this._oPopover.setModel(this.getModel());
											//notification set model
											this._oPopover.setModel(oModel);
											//popover icon selction toggle
											this._oPopover.attachAfterClose(
												function(oEvent) {
													oSource.setSelected(false); //icon selection toggle
												});

										}
										this.addDependent(this._oPopover);
										var oButton = oEvent.getSource();
										jQuery.sap.delayedCall(0, this, function() {
											this._oPopover.openBy(oButton);
										});
									}

								}, true, false, [oRenderer.LaunchpadState.Home]);
						}
					},
					error: function(oData, response) {
						console.log("Unable to read count from service-Error:"+response);
					}
				});

			});

		},

		/** 
		 * @desc this method contain logic for refresh notification Count
		 */
		onNotificationCountRefresh: function() {
			//console.log(oList;
			/*var notiControl = sap.ui.getCore().byId("notification");
			var oldCount = notiControl.getFloatingNumber();
			if (oldCount != 0 || oldCount > 0) {
				notiControl.setFloatingNumber(oldCount - 1);
			}*/
				var stringCount;
				var intCount=0;
				var notiControl = sap.ui.getCore().byId("notification");
					var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/Z_PUSH_NTF_SRV/", {
						json: true,
						loadMetadataAsync: true
					});
			
						oModel.read("/PUSH_NOTIFSet?$filter=ReadFlg eq ''&$inlinecount=allpages&$format=json", {
						
					sync: true,//$count?$filter=ReadFlg%20eq%20%27%27
					success: function(oData, response) {
						stringCount = oData.results.length;
						if (!isNaN(stringCount)) {
							intCount = parseFloat(stringCount);
							notiControl.setFloatingNumber(intCount);
						}
					/*	console.log("length: "+oData.results.length);
							console.log("length: "+response.body);
							intCount = parseFloat(oData.results.length);
								notiControl.setFloatingNumber(intCount);*/
						
						
					}
					});

		},

		/** 
		 * @desc this method contain logic for navigation to each task
		 */
		onPressOpenTask: function(oEvent) {

			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
		//	console.log("step1");
		//	try {
				var oBundle = this.getModel("i18n").getResourceBundle();

				var AppnamePO = oBundle.getText("EB_POiD"), //"Poaprv",
					AppnameSC = oBundle.getText("EB_SCiD"), //"EB_APPSHPCART",
					AppnameInvoice = oBundle.getText("VIM_CQiD"), //"VIM_COQUA",
					AppSemantecObject, AppPath;
				/*
					var AppnamePO ="Poaprv",
				AppnameSC = "EB_APPSHPCART",
				AppnameInvoice = "VIM_COQUA",
				AppSemantecObject, AppPath, Param1, Param2;*/
				var hash;
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var oItem = oEvent.getSource();

				//		console.log(oItem);

				var oCtx = oItem.getBindingContext();

				var SystemId = oCtx.getProperty("SystemId"),
					Userid = oCtx.getProperty("Userid"),
					WiId = oCtx.getProperty("WiId"),
					PoNumber = oCtx.getProperty("Identifier"),
					AppName = oCtx.getProperty("Appname");

				if (AppName === AppnamePO) {
					AppSemantecObject = "SRMPurchaseOrder-approve";
					AppPath = "SRMPurchaseOrder-approve&/detail/WorkflowTask";

				/*	oCrossAppNavigator.isIntentSupported(["SRMPurchaseOrder-approve"])
						.done(function(aResponses) {*/
							//	console.log("SRMPurchaseOrder-approve supported");

							hash = "SRMPurchaseOrder-approve&/detail/WorkflowTasks" + "(WorkItemId='" + WiId + "',PONumber='" + PoNumber + "')";
					//	})
					/*	.fail(function() {
							console.log("Issue happened during PO FIORI Navigation");
						});*/

				} else if (AppName === AppnameSC) {
					//ZAPPROVE_SC-approve&/detail/WorkflowTaskCollection(SAP__Origin='F36_400',WorkitemID='000281288393')
					AppSemantecObject = "ZAPPROVE_SC-approve";
					AppPath = "ZAPPROVE_SC-approve&/detail/WorkflowTaskCollection";
					//  var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				/*	oCrossAppNavigator.isIntentSupported(["ZAPPROVE_SC-approve"])
						.done(function(aResponses) {*/
							//	console.log("Shopping cart-approve supported");
						//	console.log("step2");
							hash = AppPath + "(SAP__Origin='" + SystemId + "',WorkitemID='" + WiId + "')";
						//		console.log("step3");
				/*		})
						.fail(function() {
							console.log("Issue happened during EB-SC FIORI Navigation");
						});*/

				} else if (AppName === AppnameInvoice) {
					/*------------added code---------------*/
					//code to get GUID for VIM navigation
					var InvNum = oCtx.getProperty("Identifier");
					var vimModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/OTX/PF05_DATA;mo;v=3;");
					vimModel.read("/Nodes(SAP__Origin='" + SystemId +
						"',nodeId='PS35_VIM_MPOEX_INV',wobjType='PS35_VIM_MPOEX',workplaceId='WP_INBOX',deviceType='DESKTOP')/Objects", {
							async: false,
							success: function(oData, response) {
								var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/Z_PUSH_NTF_SRV/");
								oModel.read("/INV_WEBIDSet(InvDocNo='" + InvNum + "')", {
									async: false,
									success: function(oData, response) {
										var GUID = oData.Id;
										hash = "InvoiceManagement-display?letterBox=false&nodeId=PS35_VIM_MPOEX_INV&semanticNavEnabled=false&system=" +
											SystemId +
											"&wobjType=PS35_VIM_MPOEX&workplaceId=WP_INBOX&/detail/" + GUID;
									},
									error: function(oData, response) {
										console.log("Issue happened during VIM FIORI Navigation");
									}

								});
							},
							error: function(oData, response) {
								console.log("Issue happened while initiating VIM model");
							}
						});
				}

				//	console.log(hash);
				//navigation to hash
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});

				//	console.log("WiId: " + WiId + " USerID: " + Userid + " SystemId: " + SystemId + "PO" + PoNumber);
				//  var hash = "SRMPurchaseOrder-approve&/detail/WorkflowTasks(WorkItemId='" + WiId + "',PONumber='" + PoNumber + "')";
				//	console.log("step4");
				//calling update from backend
				this.onUpdateOperation(oEvent);
				
				oBusyDialog.close();
			/*} catch (err) {
				oBusyDialog.close();
			}*/

		},

		/** 
		 * @desc this method contain logic forUpdate backend status
		 */
		onUpdateOperation: function(oEvent) {
			var oItem = oEvent.getSource();
			var oList = oItem.getParent();
		//	console.log("oList"+oList);
			var oCtx = oItem.getBindingContext();
			var that = this;
			var oEntry = {};
			//var oModel = this.getModel();
			var oModel = this.getModel();
			//console.log("oModel"+oModel);
			/*	var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/Z_PUSH_NTF_SRV/", {
				json: true,
				loadMetadataAsync: true
			});*/

			oEntry.SystemId = oCtx.getProperty("SystemId"),
			oEntry.Userid = oCtx.getProperty("Userid"),
			oEntry.WiId = oCtx.getProperty("WiId"),
			oEntry.Createdat = oCtx.getProperty("Createdat");
			oEntry.TaskId = oCtx.getProperty("TaskId");
			oEntry.Identifier = oCtx.getProperty("Identifier");
			oEntry.NotifTxt = oCtx.getProperty("NotifTxt");
			oEntry.Appname = oCtx.getProperty("Appname");
			oEntry.ReadFlg = "X"; //mark as read

			//	console.log("/PUSH_NOTIFSet(SystemId='" + oEntry.SystemId + "',Userid='" + oEntry.Userid + "',WiId='" + oEntry.WiId + "')");
			oModel.update("/PUSH_NOTIFSet(SystemId='" + oEntry.SystemId + "',Userid='" + oEntry.Userid + "',WiId='" + oEntry.WiId + "')",
				oEntry, {
					method: "PUT",
					loadMetadataAsync: true,
					success: function(data) {
						/*this.oList.getBinding("items").refresh();*/
					//	that.oList.getModel().updateBindings(true);
						oList.getModel().refresh(true);
						that.onNotificationCountRefresh();
							//	console.log("Data updated sucessfully");
					},
					error: function(e) {
									console.log("Error while updating read flag : " + e);
					}
				});
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function() {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function(oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}

	});
});