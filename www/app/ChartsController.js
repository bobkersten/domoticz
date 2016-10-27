define( [ 'app' ], function ( app ) {
	app.controller( 'ChartsController', [ '$scope', '$rootScope', '$location', '$http', '$interval', 'permissions', function( $scope, $rootScope, $location, $http, $interval, permissions ) {

		var ctrl = this;

		ctrl.screens = [];
		ctrl.activeScreen = null;
		ctrl.charts = [];
		ctrl.activeChart = null;
		ctrl.series = [];
		ctrl.activeserie = null;
		ctrl.devices = {};

		ctrl.selectedRange = 'day';

		ctrl.types = { 1: [ 'spline', $.t( 'Line' ) ], 2: [ 'areaspline', $.t( 'Area' ) ], 3: [ 'column', $.t( 'Bar' ) ] };
		ctrl.positions = { 1: $.t( 'Left' ), 2: $.t( 'Right' ) };

		function init() {
			$( '#chartscontent' ).i18n();
			$( '#chartseditcontent' ).i18n();

			$( '#chartscontent' ).hide();
			$( '#chartseditcontent' ).hide();

			// Charts table.
			$( '#chartstable' ).dataTable( {
				"sDom": '<"H"lfrC>t<"F"ip>',
				"oTableTools": {
					"sRowSelect": "single",
				},
				"bSort": false,
				"bProcessing": true,
				"bStateSave": true,
				"bJQueryUI": true,
				"aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
				"iDisplayLength" : 25,
				"sPaginationType": "full_numbers",
				language: $.DataTableLanguage
			} );

			// Series table.
			$( '#chartseriestable' ).dataTable( {
				"sDom": '<"H"lfrC>t<"F"ip>',
				"oTableTools": {
					"sRowSelect": "single",
				},
				"bSort": false,
				"bProcessing": true,
				"bStateSave": true,
				"bJQueryUI": true,
				"aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
				"iDisplayLength" : 25,
				"sPaginationType": "full_numbers",
				language: $.DataTableLanguage
			} );

			// Add or edit screen dialog.
			var oEditScreenButtons = {};
			oEditScreenButtons[$.t( 'Save' )] = function() {
				var bValid = true, oDialog = $( this );
				bValid = bValid && checkLength( $( '#dialog-editscreen #screenname' ), 2, 100 );
				if ( bValid ) {
					$( '#modal' ).show();
					oDialog.dialog( 'close' );

					var sUrl, oData;
					if ( oDialog.data( 'new' ) ) {
						sUrl = 	'json.htm?type=command&param=addscreen';
						oData = { name: $( '#dialog-editscreen #screenname' ).val() };
					} else {
						sUrl = 	'json.htm?type=command&param=updatescreen';
						oData = { name: $( '#dialog-editscreen #screenname' ).val(), idx: ctrl.activeScreen.idx };
					}
					$.ajax( {
						url			: sUrl,
						data		: oData,
						dataType	: 'json',
						success		: function ( oResults_ ) {
							if ( oResults_.status == 'OK' ) {
								if ( oDialog.data( 'new' ) ) {
									var oScreen = { idx: oResults_.idx, Name: $( '#dialog-editscreen #screenname' ).val(), Active: true, Range: 'week' };
									ctrl.screens.push( oScreen );
									ctrl.activeScreen = oScreen;
									ctrl.charts = [];
									ctrl.activeChart = null;
									ctrl.series = [];
									ctrl.activeSerie = null;
								} else {
									ctrl.activeScreen.Name = $( '#dialog-editscreen #screenname' ).val();
								}
								$scope.$apply();
								ctrl.editScreen();
								$( '#modal' ).hide();
							}
						}
					} );
				}
			};
			oEditScreenButtons[$.t( 'Cancel' )] = function() {
				$( this ).dialog( 'close' );
			};
			$( '#dialog-editscreen' ).dialog( {
				autoOpen	: false,
				width		: 'auto',
				height		: 'auto',
				modal		: true,
				resizable	: false,
				buttons		: oEditScreenButtons,
				close		: function() {
					$( this ).dialog( 'close' );
				}
			} );
			$( '#dialog-editscreen' ).i18n();

			// Add or edit chart dialog.
			var oEditChartButtons = {};
			oEditChartButtons[$.t( 'Save' )] = function() {
				var bValid = true, oDialog = $( this );
				bValid = bValid && checkLength( $( '#dialog-editchart #chartname' ), 2, 100 );
				if ( bValid ) {
					$( '#modal' ).show();
					oDialog.dialog( 'close' );

					var sUrl, oData;
					if ( oDialog.data( 'new' ) ) {
						sUrl = 	'json.htm?type=command&param=addchart';
						oData = { name: $( '#dialog-editchart #chartname' ).val(), screen_idx: ctrl.activeScreen.idx };
					} else {
						sUrl = 	'json.htm?type=command&param=updatechart';
						oData = { name: $( '#dialog-editchart #chartname' ).val(), idx: ctrl.activeChart.idx };
					}

					console.log( sUrl );
					console.log( oData );

					$.ajax( {
						url			: sUrl,
						data		: oData,
						dataType	: 'json',
						success		: function ( oResults_ ) {
							if ( oResults_.status == 'OK' ) {
								if ( oDialog.data( 'new' ) ) {
									var oChart = { idx: oResults_.idx, Name: $( '#dialog-editchart #chartname' ).val() };
									ctrl.charts.push( oChart );
									ctrl.activeChart = oChart;
									ctrl.series = [];
									ctrl.activeSerie = null;
								} else {
									ctrl.activeChart.Name = $( '#dialog-editchart #chartname' ).val();
								}
								$scope.$apply();
								ctrl.editScreen();
								$( '#modal' ).hide();
							}
						}
					} );
				}
			};
			oEditChartButtons[$.t( 'Cancel' )] = function() {
				$( this ).dialog( 'close' );
			};
			$( '#dialog-editchart' ).dialog( {
				autoOpen	: false,
				width		: 'auto',
				height		: 'auto',
				modal		: true,
				resizable	: false,
				buttons		: oEditChartButtons,
				close		: function() {
					$( this ).dialog( 'close' );
				}
			} );
			$( '#dialog-editchart' ).i18n();

			// Add or edit serie dialog.
			var oEditSerieButtons = {};
			oEditSerieButtons[$.t( 'Save' )] = function() {
				var bValid = true, oDialog = $( this );
				if ( bValid ) {
					$( '#modal' ).show();
					oDialog.dialog( 'close' );
					var sUrl, oData;
					if ( oDialog.data( 'new' ) ) {
						sUrl = 	'json.htm?type=command&param=addserie';
						oData = {
							device_idx	: $( '#dialog-editserie #combodevice' ).val(),
							graphtype	: $( '#dialog-editserie #combotype' ).val(),
							position	: $( '#dialog-editserie #comboposition' ).val(),
							color		: $( '#dialog-editserie #combocolor' ).val(),
							chart_idx	: ctrl.activeChart.idx
						};
					} else {
						sUrl = 	'json.htm?type=command&param=updateserie';
						oData = {
							device_idx	: $( '#dialog-editserie #combodevice' ).val(),
							graphtype	: $( '#dialog-editserie #combotype' ).val(),
							position	: $( '#dialog-editserie #comboposition' ).val(),
							color		: $( '#dialog-editserie #combocolor' ).val(),
							idx			: ctrl.activeSerie.idx
						};
					}

					console.log( sUrl );
					console.log( oData );

					$.ajax( {
						url			: sUrl,
						data		: oData,
						dataType	: 'json',
						success		: function ( oResults_ ) {
							if ( oResults_.status == 'OK' ) {
								// A new list of series is fetched from the server because additional data from the
								// devices is required.
								var SerieIdx = oDialog.data( 'new' ) ? oResults_.idx : ctrl.activeSerie.idx;
								loadSeries( ctrl.activeChart.idx, function( aSeries_ ) {
									ctrl.series = aSeries_;
									$.each( ctrl.series, function( iIndex_, oSerie_ ) {
										if ( SerieIdx == oSerie_.idx ) {
											ctrl.activeSerie = oSerie_;
										}
									} );
									$scope.$apply();
									ctrl.editChart();
									$( '#modal' ).hide();
								} );
							}
						}
					} );
				}
			};
			oEditSerieButtons[$.t( 'Cancel' )] = function() {
				$( this ).dialog( 'close' );
			};
			$( '#dialog-editserie' ).dialog( {
				autoOpen	: false,
				width		: 'auto',
				height		: 'auto',
				modal		: true,
				resizable	: false,
				buttons		: oEditSerieButtons,
				close		: function() {
					$( this ).dialog( 'close' );
				}
			} );
			$( '#dialog-editserie' ).i18n();
		};

		function loadDevices( fCallback_ ) {
			return $.ajax( {
				url			: 'json.htm?type=devices&displayhidden=true&used=true',
				dataType	: 'json',
				success		: function( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						if ( oResults_.result && oResults_.result.length > 0 ) {
							fCallback_( oResults_.result );
						} else {
							fCallback_( [] );
						}
					}
				}
			} ).promise();
		};

		function loadScreens( fCallback_ ) {
			return $.ajax( {
				url			: 'json.htm?type=screens',
				dataType	: 'json',
				success		: function ( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						if ( oResults_.result && oResults_.result.length > 0 ) {
							fCallback_( oResults_.result );
						} else {
							fCallback_( [] );
						}
					}
				}
			} ).promise();
		};

		function loadCharts( iScreenIdx_, fCallback_ ) {
			return $.ajax( {
				url			: 'json.htm?type=charts',
				data		: { screen_idx: iScreenIdx_ },
				dataType	: 'json',
				success		: function ( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						fCallback_( oResults_.result || [] );
					}
				}
			} ).promise();
		};

		function loadSeries( iChartIdx_, fCallback_ ) {
			return $.ajax( {
				url			: 'json.htm?type=series',
				data		: { chart_idx: iChartIdx_ },
				dataType	: 'json',
				success		: function ( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						fCallback_( oResults_.result || [] );
					}
				}
			} ).promise();
		}

		// This will make these functions global (window); not very nice :/
		changeChartOrder = function( iOrder_, iScreenIdx_, iChartIdx_, oEvent_ ) {
			oEvent_.cancelBubble = true;
			if ( oEvent_.stopPropagation ) {
				oEvent_.stopPropagation();
			}
			$( '#modal' ).show();
			$.ajax( {
				url			: 'json.htm?type=command&param=changechartorder',
				data		: { screen_idx: iScreenIdx_, idx: iChartIdx_, way: iOrder_ },
				dataType	: 'json',
				success: function() {
					// TODO change order of charts locally to reflect remote witout ajax request.
					loadCharts( iScreenIdx_, function( aCharts_ ) {
						ctrl.charts = aCharts_;
						if ( ctrl.activeChart != null ) {
							$.each( ctrl.charts, function( iIndex_, oChart_ ) {
								if ( ctrl.activeChart.idx == oChart_.idx ) {
									ctrl.activeChart = oChart_;
								}
							} );
						}
						$scope.$apply();
						ctrl.editScreen();
						$( '#modal' ).hide();
					} );
				}
			} );
		};
		changeSerieOrder = function( iOrder_, iChartIdx_, iSerieIdx_, oEvent_ ) {
			oEvent_.cancelBubble = true;
			if ( oEvent_.stopPropagation ) {
				oEvent_.stopPropagation();
			}
			$( '#modal' ).show();
			$.ajax( {
				url			: 'json.htm?type=command&param=changeserieorder',
				data		: { chart_idx: iChartIdx_, idx: iSerieIdx_, way: iOrder_ },
				dataType	: 'json',
				success: function() {
					// TODO change order of series locally to reflect remote witout ajax request.
					loadSeries( iChartIdx_, function( aSeries_ ) {
						ctrl.series = aSeries_;
						if ( ctrl.activeSerie != null ) {
							$.each( ctrl.series, function( iIndex_, oSerie_ ) {
								if ( ctrl.activeSerie.idx == oSerie_.idx ) {
									ctrl.activeSerie = oSerie_;
								}
							} );
						}
						$scope.$apply();
						ctrl.editChart();
						$( '#modal' ).hide();
					} );
				}
			} );
		};

		ctrl.selectRange = function( sRange_ ) {
			ctrl.selectedRange = sRange_;
			$.each( ctrl.charts, function( iIndex_, oChart_ ) {
				ctrl.drawChart( $( '#chart-' + oChart_.idx ), oChart_ );
			} );
			$.ajax( {
				url			: 'json.htm?type=command&param=setscreenrange',
				data		: { idx: ctrl.activeScreen.idx, range: sRange_ },
				dataType	: 'json'
			} );
		};

		ctrl.selectScreen = function() {
			$( '#modal' ).show();
			loadCharts( ctrl.activeScreen.idx, function( aCharts_ ) {
				ctrl.charts = aCharts_;
				ctrl.activeChart = null;
				ctrl.series = [];
				ctrl.activeSerie = null;
				ctrl.selectedRange = ctrl.activeScreen.Range;
				$scope.$apply();
				$( '#chartscontent' ).show();
				$( '#chartseditcontent' ).hide();
				$.each( aCharts_, function( iIndex_, oChart_ ) {
					ctrl.drawChart( $( '#chart-' + oChart_.idx ), oChart_ );
				} );
				$( '#modal' ).hide();
			} );
			$.ajax( {
				url			: 'json.htm?type=command&param=setactivescreen',
				data		: { idx: ctrl.activeScreen.idx },
				dataType	: 'json'
			} );
		};

		ctrl.editScreen = function() {
			$( '#chartstable tbody' ).off();

			var oTable = $( '#chartstable' ).dataTable();
			oTable.fnClearTable();
			$.each( ctrl.charts, function( iIndex_, oChart_ ) {
				var sUpDownImg = '';
				if ( iIndex_ != ctrl.charts.length - 1 ) {
					sUpDownImg += '<img src="images/down.png" onclick="changeChartOrder(1,' + ctrl.activeScreen.idx + ',' + oChart_.idx + ',arguments[0] || window.event);" class="lcursor" width="16" height="16">';
				} else {
					sUpDownImg +='<img src="images/empty16.png" width="16" height="16">';
				}
				if ( iIndex_ != 0 ) {
					if ( sUpDownImg.length > 0 ) {
						sUpDownImg += '&nbsp;';
					}
					sUpDownImg += '<img src="images/up.png" onclick="changeChartOrder(0,' + ctrl.activeScreen.idx + ',' + oChart_.idx + ',arguments[0] || window.event);" class="lcursor" width="16" height="16">';
				}
				oTable.fnAddData( { chart: oChart_, '0':oChart_.Name, '1':sUpDownImg } );
			} );

			if ( ctrl.activeChart == null ) {
				$( '#chartseditcontent #chartupdate' ).attr( 'class', 'btnstyle3-dis' );
				$( '#chartseditcontent #chartdelete' ).attr( 'class', 'btnstyle3-dis' );
			} else {
				var iRowIndex = ctrl.charts.indexOf( this.activeChart );
				$( oTable.$( 'tr' )[iRowIndex] ).addClass( 'row_selected' );
				$( '#chartseditcontent #chartupdate' ).attr( 'class', 'btnstyle3' );
				$( '#chartseditcontent #chartdelete' ).attr( 'class', 'btnstyle3' );
				ctrl.editChart();
			}

			$( '#chartstable tbody' ).on( 'click', 'tr', function () {
				if ( $( this ).hasClass( 'row_selected' ) ) {
					$( this ).removeClass( 'row_selected' );
					ctrl.activeChart = null;
					ctrl.series = [];
					ctrl.activeSerie = null;
					$( '#chartseditcontent #chartupdate' ).attr( 'class', 'btnstyle3-dis' );
					$( '#chartseditcontent #chartdelete' ).attr( 'class', 'btnstyle3-dis' );
					$scope.$apply();
				} else {
					var oData = oTable.fnGetData( this );
					if ( oData && oData.chart ) {
						oTable.$( 'tr.row_selected' ).removeClass( 'row_selected' );
						$( this ).addClass( 'row_selected' );
						$( '#chartseditcontent #chartupdate' ).attr( 'class', 'btnstyle3' );
						$( '#chartseditcontent #chartdelete' ).attr( 'class', 'btnstyle3' );
						ctrl.activeChart = oData.chart;
						ctrl.selectChart();
					}
				}
			} );

			$( '#chartscontent' ).hide();
			$( '#chartseditcontent' ).show();
		};

		ctrl.editScreenName = function( bNew_ ) {
			$( '#dialog-editscreen' )
				.data( 'new', !!bNew_ )
				.dialog( 'option', 'title', bNew_ ? $.t( 'Add' ) : $.t( 'Rename' ) )
				.dialog( 'open' )
			;
			$( '#dialog-editscreen #screenname' ).val( bNew_ ? '' : ctrl.activeScreen.Name );
		};

		ctrl.deleteScreen = function() {
			$.ajax( {
				url			: 'json.htm?type=command&param=deletescreen',
				data		: { idx: ctrl.activeScreen.idx },
				dataType	: 'json',
				success		: function ( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						var iIndex = ctrl.screens.indexOf( ctrl.activeScreen );
						ctrl.screens.splice( iIndex, 1 );
						if ( ctrl.screens.length > 0 ) {
							ctrl.activeScreen = ctrl.screens[Math.max( 0, iIndex - 1 )];
							ctrl.selectScreen();
						} else {
							ctrl.activeScreen = null;
							ctrl.charts = [];
							ctrl.activeChart = null;
							ctrl.series = [];
							ctrl.activeSerie = null;
							$( '#chartseditcontent' ).hide();
							$scope.$apply();
							$( '#chartscontent' ).show();
						}
					}
				}
			} );
		};

		ctrl.selectChart = function() {
			$( '#modal' ).show();
			loadSeries( ctrl.activeChart.idx, function( aSeries_ ) {
				ctrl.series = aSeries_;
				ctrl.activeSerie = null;
				$scope.$apply();
				ctrl.editChart();
			} );
		};

		ctrl.editChart = function() {
			$( '#chartseriestable tbody' ).off();

			var oTable = $( '#chartseriestable' ).dataTable();
			oTable.fnClearTable();

			$.each( ctrl.series, function( iIndex_, oSerie_ ) {
				var sUpDownImg = '';
				if ( iIndex_ != ctrl.series.length - 1 ) {
					sUpDownImg += '<img src="images/down.png" onclick="changeSerieOrder(1,' + ctrl.activeChart.idx + ',' + oSerie_.idx + ',arguments[0] || window.event);" class="lcursor" width="16" height="16">';
				} else {
					sUpDownImg +='<img src="images/empty16.png" width="16" height="16">';
				}
				if ( iIndex_ != 0 ) {
					if ( sUpDownImg.length > 0 ) {
						sUpDownImg += '&nbsp;';
					}
					sUpDownImg += '<img src="images/up.png" onclick="changeSerieOrder(0,' + ctrl.activeChart.idx + ',' + oSerie_.idx + ',arguments[0] || window.event);" class="lcursor" width="16" height="16">';
				}
				oTable.fnAddData( {
					serie		: oSerie_,
					'0'			: '[' + oSerie_.HardwareName + '] ' + oSerie_.DeviceName,
					'1'			: ctrl.types[parseInt(oSerie_.Type)][1],
					'2'			: ctrl.positions[parseInt(oSerie_.Position)],
					'3'			: oSerie_.Color,
					'4'			: sUpDownImg
				} );
			} );

			if ( ctrl.activeSerie == null ) {
				$( '#chartseditcontent #serieupdate' ).attr( 'class', 'btnstyle3-dis' );
				$( '#chartseditcontent #seriedelete' ).attr( 'class', 'btnstyle3-dis' );
			} else {
				var iRowIndex = ctrl.series.indexOf( this.activeSerie );
				$( oTable.$( 'tr' )[iRowIndex] ).addClass( 'row_selected' );
				$( '#chartseditcontent #serieupdate' ).attr( 'class', 'btnstyle3' );
				$( '#chartseditcontent #seriedelete' ).attr( 'class', 'btnstyle3' );
			}

			$( '#chartseriestable tbody' ).on( 'click', 'tr', function () {
				if ( $( this ).hasClass( 'row_selected' ) ) {
					$( this ).removeClass( 'row_selected' );
					ctrl.activeSerie = null;
					$( '#chartseditcontent #serieupdate' ).attr( 'class', 'btnstyle3-dis' );
					$( '#chartseditcontent #seriedelete' ).attr( 'class', 'btnstyle3-dis' );
				} else {
					var oData = oTable.fnGetData( this );
					if ( oData && oData.serie ) {
						oTable.$( 'tr.row_selected' ).removeClass( 'row_selected' );
						$( this ).addClass( 'row_selected' );
						$( '#chartseditcontent #serieupdate' ).attr( 'class', 'btnstyle3' );
						$( '#chartseditcontent #seriedelete' ).attr( 'class', 'btnstyle3' );
						ctrl.activeSerie = oData.serie;
					}
				}
			} );

			ctrl.drawChart( $( '#edit-chart-preview' ), ctrl.activeChart );
		};

		ctrl.editChartName = function( bNew_ ) {
			$( '#dialog-editchart' )
				.data( 'new', !!bNew_ )
				.dialog( 'option', 'title', bNew_ ? $.t( 'Add' ) : $.t( 'Rename' ) )
				.dialog( 'open' )
			;
			$( '#dialog-editchart #chartname' ).val( bNew_ ? '' : ctrl.activeChart.Name );
		};

		ctrl.deleteChart = function() {
			$.ajax( {
				url			: 'json.htm?type=command&param=deletechart',
				data		: { idx: ctrl.activeChart.idx },
				dataType	: 'json',
				success		: function ( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						var iIndex = ctrl.charts.indexOf( ctrl.activeChart );
						ctrl.charts.splice( iIndex, 1 );
						ctrl.activeChart = null;
						ctrl.series = [];
						ctrl.activeSerie = null;
						$scope.$apply();
						ctrl.editScreen();
					}
				}
			} );
		};

		ctrl.drawChart = function( oEl_, oChart_ ) {
			loadSeries( oChart_.idx, function( aSeries_ ) {
				var aDataLoaders = [], aSeriesData = [], fMin = NaN, fMax = NaN;
				$.each( aSeries_, function( iIndex_, oSerie_ ) {

					var oDevice = ctrl.devices['device_idx' + oSerie_.DeviceRowID];

					var sGraphType, sValueProperty;
					if ( oDevice.SubType == 'Custom Sensor' ) {
						sGraphType = 'Percentage';
						sValueProperty = 'v';
					} else if ( oDevice.SubType == 'Percentage' ) {
						sGraphType = 'Percentage';
						sValueProperty = 'v_avg';
					} else if ( oDevice.SubType == 'kWh' ) {
						sGraphType = 'counter';
						sValueProperty = 'v';
					} else if ( oDevice.Type == 'Thermostat' || oDevice.Type == 'Temp' || oDevice.SubType == 'SetPoint' || oDevice.Type == 'Temp + Humidity + Baro' || oDevice.Type == 'Temp + Humidity' ) {
						sGraphType = 'temp';
						sValueProperty = 'te';
					} else if ( oDevice.SubType == 'Gas' ) {
						sGraphType = 'counter';
						sValueProperty = 'v';
					} else {
						console.warn( 'Unknown device with type=' + oDevice.Type + ', subtype=' + oDevice.SubType );
						return;
					}

					aDataLoaders.push(
						$.ajax( {
							url			: 'json.htm?type=graph',
							data		: { idx: oDevice.idx, sensor: sGraphType, range: ctrl.selectedRange },
							dataType	: 'json',
							success		: function ( oResults_ ) {
								console.log( oResults_ );
								if ( oResults_.status == 'OK' ) {
									var aData = [];
									$.each( oResults_.result, function ( iIndex_, oItem_ ) {
										var oDate, fValue = parseFloat( oItem_[sValueProperty] );
										if ( ctrl.selectedRange == 'day' ) {
											oDate = GetUTCFromString( oItem_.d );
										} else {
											oDate = GetDateFromString( oItem_.d );
										}
										if ( fMin == NaN ) {
											alert( 'kee' );
										}
										fMin = ( isNaN( fMin ) ? fValue : Math.min( fMin, fValue ) );
										fMax = ( isNaN( fMax ) ? fValue : Math.max( fMax, fValue ) );
										aData.push( [ oDate, fValue ] );
									} );
									aSeriesData.push( {
										id			: 'chart_' + oChart_.idx + '_' + oSerie_.idx,
										name		: oSerie_.DeviceName,
										color		: oSerie_.Color,
										type		: ctrl.types[oSerie_.Type][0],
										data		: aData,
										yAxis		: parseInt( oSerie_.Position ) - 1,
										lineWidth	: 3,
										min			: 10,
										states		: {
											hover: {
												lineWidth: 3
											}
										}
									} );
								}
							}
						} ).promise()
					);
				} );



				$.when.apply( $, aDataLoaders ).done( function() {
					var oChart = oEl_.highcharts( {
						title: {
							text: oChart_.Name
						},
						legend: {
							enabled: true
						},
						credits: {
							enabled: false
						},
						alignTicks: false,
						xAxis: {
							type: 'datetime'
						},
						yAxis: [
							{
								min: fMin > 0 ? Math.max( 0, fMin - ( 0.05 * ( fMax - fMin ) ) ) : fMin,
								title: {
									text: 'Left'
								}
							}, {
								min: fMin,
								title: {
									text: 'Right'
								},
								opposite: true
							}
						],
						series: aSeriesData
					} );
				} );
			} );
		};

		ctrl.editSerie = function( bNew_ ) {
			$( '#dialog-editserie' )
				.data( 'new', !!bNew_ )
				.dialog( 'option', 'title', bNew_ ? $.t( 'Add' ) : $.t( 'Edit' ) )
				.dialog( 'open' )
			;
			$( '#dialog-editserie #combodevice' ).val( bNew_ ? $( '#dialog-editserie #combodevice option' ).first().val() : ctrl.activeSerie.DeviceRowID );
			$( '#dialog-editserie #combotype' ).val( bNew_ ? $( '#dialog-editserie #combotype option' ).first().val() : ctrl.activeSerie.Type );
			$( '#dialog-editserie #comboposition' ).val( bNew_ ? $( '#dialog-editserie #comboposition option' ).first().val() : ctrl.activeSerie.Position );
			$( '#dialog-editserie #combocolor' ).val( bNew_ ? $( '#dialog-editserie #combocolor option' ).first().val() : ctrl.activeSerie.Color );
		};

		ctrl.deleteSerie = function() {
			$.ajax( {
				url			: 'json.htm?type=command&param=deleteserie',
				data		: { idx: ctrl.activeSerie.idx },
				dataType	: 'json',
				success		: function ( oResults_ ) {
					if ( oResults_.status == 'OK' ) {
						var iIndex = ctrl.series.indexOf( ctrl.activeSerie );
						ctrl.series.splice( iIndex, 1 );
						ctrl.activeSerie = null;
						$scope.$apply();
						ctrl.editChart();
					}
				}
			} );
		};

		init();

		$( '#modal' ).show();
		$.when(
			loadDevices( function( aDevices_ ) {
				ctrl.devices = {};
				$.each( aDevices_, function( iIndex_, oDevice_ ) {
					ctrl.devices['device_idx' + oDevice_.idx] = oDevice_;
				} );
			} ),
			loadScreens( function( aScreens_ ) {
				ctrl.screens = aScreens_;
				$.each( aScreens_, function( iIndex_, oScreen_ ) {
					if ( 0 == iIndex_ || oScreen_.Active ) {
						ctrl.activeScreen = oScreen_;
						ctrl.selectedRange = oScreen_.Range;
					}
				} );
			} )
		).done( function() {
			if ( ctrl.activeScreen != null ) {
				ctrl.selectScreen();
			} else {
				$scope.$apply();
				$( '#chartscontent' ).show();
				$( '#chartseditcontent' ).hide();
				$( '#modal' ).hide();
			}
		} );

	} ] );

} );
