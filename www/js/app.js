// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-material','ionic.cloud', 'ionMdInput','ngCordova','angularjs-gauge','chart.js','ion-datetime-picker'])

.run(function($ionicPlatform, $ionicLoading,$rootScope,$state) {
	
    $ionicPlatform.ready(function() {
		// ChartJS
        Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 0.8)';
		Chart.defaults.global.defaultFontFamily = "'Prompt', sans-serif";
		Chart.defaults.global.defaultFontSize = 12;
		Chart.defaults.global.legend.labels.boxWidth = 20;
		Chart.defaults.global.colors  =  ['#2fb8e1','#306c81','#a3dcdf','#c5dce6','#78ffff','#2ba8cd','#2c6376','#95c8cb','#b4c8d2','#6ee8e8'];
		
		// TensorFlow
        var tf = new TensorFlow('food-model', {
            'label': 'My Custom Model',
            'model_path': "https://storage.googleapis.com/ha-models/food_model_v4.zip#output_graph_round_v4.pb",
            'label_path': "https://storage.googleapis.com/ha-models/food_model_v4.zip#output_labels_v4.txt",
            'input_size': 299,
            'image_mean': 128,
            'image_std': 128,
            'input_name': 'Mul',
            'output_name': 'final_result'
        })
        tf.onprogress = function(evt) {
          
          if (evt['status'] == 'downloading'){
			  $ionicLoading.show({template: "Please wait a moment<BR/>We are downloading food prediction model...<BR/>"+evt.label});
              console.log("Downloading model files...");
              console.log(evt.label);
              if (evt.detail) {
                  // evt.detail is from the FileTransfer API
                  var $elem = $('progress');
                  $elem.attr('max', evt.detail.total);
                  $elem.attr('value', evt.detail.loaded);
              }
          } else if (evt['status'] == 'unzipping') {
              console.log("Extracting contents...");
			  $ionicLoading.show({template: "Unzipping the prediction model"});
          } else if (evt['status'] == 'initializing') {
			  $ionicLoading.show({template: "Initializing the prediction model"});
              console.log("Initializing TensorFlow");
          }
        };
        tf.load().then(function() {
            $ionicLoading.hide();
            console.log("Model loaded");
            $rootScope.tf = tf;
        });
		//$ionicPush.plugin.on('notification', function(data) { alert(data); });

		
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        //if (window.cordova && window.cordova.plugins.Keyboard) {
        //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //}
        //if (window.StatusBar) {
        //    // org.apache.cordova.statusbar required
        //    StatusBar.styleDefault();
        //}
    });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,$ionicCloudProvider) {
	
	$ionicCloudProvider.init({
        "core": {
            "app_id": "f891b68c"
        },
        "push": {
            "sender_id": "33514483534",
            "pluginConfig": {
                "ios": {
                "badge": true,
                "sound": true
                },
                "android": {
                "iconColor": "#343434"
                }
            }
        }
    });
	
	
	
    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(0);

    /*
    // Turn off back button text
	*/
    $ionicConfigProvider.backButton.previousTitleText(false);
 

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
   
    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            },
        }
    })
	
	.state('app.logout', {
		url: '/logout',
		views: {
            'menuContent': {
			templateUrl: 'templates/login.html',
			controller: 'LogoutCtrl'
			},
		}
	})

    .state('app.home', {
        url: '/home',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            },
            'fabContent': {
              //  template: '<button id="fab-survey" class="button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-plus spin"></i></button>',
                controller: function ($timeout) {
                /*    $timeout(function () {
                        document.getElementById('fab-survey').classList.toggle('on');
                    }, 800);
				*/
                }
				
            }
        }
    })
	
	 .state('app.analysis', {
        url: '/analysis',
        views: {
            'menuContent': {
                templateUrl: 'templates/analysis.html',
                controller: 'AnalysisCtrl'
            },
            'fabContent': {}
            }
    })
	
	 .state('app.register', {
        url: '/register',
        views: {
            'menuContent': {
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            },
            'fabContent': {}
            }
    })
	
	.state('app.patientrecord', {
        url: '/patientrecord',
        views: {
            'menuContent': {
                templateUrl: 'templates/patientRecord.html',
                controller: 'PatientRecordCtrl'
            },
			'fabContent': { 
            }

        }
    })
	
	.state('app.consumption', {
        url: '/consumption/:cdate',
        views: {
            'menuContent': {
                templateUrl: 'templates/consumption.html',
                controller: 'ConsumptionCtrl'
            },
            'fabContent': {
                template: '<button id="fab-camrecord" ng-click="takeImage()" class="button button-fab button-fab-top-right button-red-violet spin"><i class="icon ion-camera"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-camrecord').classList.toggle('on');
                    }, 800);

                }

            }

        }
    })
	
	 .state('app.listConsumption', {
         url: '/listConsumption/:mealtype/:cdate',
         views: {
             'menuContent': {
                 templateUrl: 'templates/listConsumption.html',
                 controller: 'listConsumptionCtrl'
             },
             'fabContent': {
               template: '<button id="fab-record" ng-click="newConsumptionRecord()" class="button button-fab button-fab-bottom-right button-red-violet spin"><i class="icon ion-plus"></i></button>',
               controller: function ($timeout) {
                   $timeout(function () {
                       document.getElementById('fab-record').classList.toggle('on');
                   }, 800);

               }
             }
        }
     })
	 
	 .state('app.recordConsumption', {
        url: '/recordConsumption/:mealtype/:cdate',
        views: {
            'menuContent': {
                templateUrl: 'templates/recordConsumption.html',
                controller: 'RecordConsumptionCtrl'
            },
            'fabContent': {}
            }
    })
	
	.state('app.listsurveyform', {
        url: '/listsurveyform',
        views: {
            'menuContent': {
                templateUrl: 'templates/listSurveyForm.html',
                controller: 'ListSurveyFormCtrl'
            },
            'fabContent': {}
            }
    })
	
	.state('app.listvoucher', {
        url: '/listvoucher',
        views: {
            'menuContent': {
                templateUrl: 'templates/listVoucher.html',
                controller: 'ListVoucherCtrl'
            },
            'fabContent': {}
            }
    })
	
	.state('app.newappointment', {
        url: '/newappointment',
        views: {
            'menuContent': {
                templateUrl: 'templates/newAppointment.html',
                controller: 'NewAppointmentCtrl'
            },
			'fabContent': { 
            }

        }
    })
	
	.state('app.listappointment', {
        url: '/listappointment',
        views: {
            'menuContent': {
                templateUrl: 'templates/listAppointment.html',
                controller: 'ListAppointmentCtrl'
            },
			'fabContent': { 
				template: '<button id="fab-newAppointment" ui-sref="app.newappointment" class="button button-fab button-fab-top-right expanded button-red-violet spin"><i class="icon ion-plus"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-newAppointment').classList.toggle('on');
                    }, 500);
                }
            }
        }
    })
	
	.state('app.lifestyle', {
        url: '/lifestyle/:rdate',
        views: {
            'menuContent': {
                templateUrl: 'templates/lifestyle.html',
                controller: 'LifestyleCtrl'
            },
			'fabContent': { 
				template: '<button id="fab-newlifestyle" ng-click="openModal()" class="button button-fab button-fab-top-right expanded button-red-violet ink spin"><i class="icon ion-plus"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-newlifestyle').classList.toggle('on');
                    }, 500);
                }
            }
        }
    })
	
	.state('app.rendersurveyform', {
        url: '/rendersurveyform/:formid',
        views: {
            'menuContent': {
                templateUrl: 'templates/renderSurveyForm.html',
                controller: 'RenderSurveyFormCtrl'
            },
            'fabContent': {}
            }
    })

	.state('app.diagnosis', {
          url: '/diagnosis/:sindex',
          views: {
              'menuContent': {
                  templateUrl: 'templates/diagnosis.html',
                  controller: 'DiagnosisCtrl'
              },
              'fabContent': {}
         }
      })
    .state('app.newsContent', {
        url: '/newsContent/:key',
        views: {
            'menuContent': {
                templateUrl: 'templates/NewsContent.html',
                controller: 'NewsContentCtrl'
            },
            'fabContent': {}
            }
    }) 
    
    .state('app.promotionContent', {
        url: '/promotionContent/:key',
        views: {
            'menuContent': {
                templateUrl: 'templates/PromotionContent.html',
                controller: 'PromotionContentCtrl'
            },
            'fabContent': {}
            }
    }) 
     .state('app.NewsAndPromotion', {
        url: '/NewsAndPromotion',
        views: {
            'menuContent': {
                templateUrl: 'templates/newsPromotion.html',
                controller: 'NewsAndPromotionCtrl'
            },
            'fabContent': {}
            }
    })
	
	
	;
    

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');
});
