/**
 * Shell Table Parser
 */

module.exports.parse = function( output, option ){
    // 首先要分隔行
    var linesTmp = output.split( '\n' );
    var lines = [];
    var titleInfo = {};
    // 获取数据
    var tableArray = [];
    var colCount = {};
    var lineArray = [];
    var longest;
    var colIdx;

    // 清除所有的空行
    linesTmp.forEach(function( line ){
        if( line.trim() ){
            lines.push( line );
        }
    });

    // 逐行扫描
    lines.forEach(function( line, index ){



        // 认为第一行为标题行
        if( index == 0 ){
            var fields = line.split( /\s+/ );
            // 保存各字段的开始和结束位置
            fields.forEach(function( field ){

                if( field ){
                    var info = titleInfo[ field ] = {};

                    info.titleBegin = line.indexOf( field );
                    info.titleEnd = info.titleBegin + field.length - 1;
                }
            });
        }
        else {
            // 记录单行的位置情况，防止出现多次出现相同值的情况
            var valuePosRecord = {};
            var values = line.trim().split( /\s+/ );
            values.forEach(function( value ){

                var begin = line.indexOf( value, valuePosRecord[ value ] );
                var end = begin + value.length - 1;
                valuePosRecord[ value ] = end;

                if( !colCount[ begin ] ){
                    colCount[ begin ] = 0;
                }
                if( !colCount[ end ] ){
                    colCount[ end ] = 0;
                }

                colCount[ begin ]++;
                colCount[ end ]++;

            });

            // 计算最长的一行
            if( longest == undefined ){
                longest = line.length;
            }
            else if( longest < line.length ){
                longest = line.length;
            }
        }
    });

    var dataLineLen = lines.length - 1;
    // 确定出可以作为分割线的列数
    for( colIdx in colCount ){
        if( colCount[ colIdx ] == dataLineLen ){
            lineArray.push( colIdx );
        }
    }
    // 将最长一行加进去作为结尾
    lineArray.push( String( longest - 1 ) );

    console.log( 'COL COUNT', colCount );
    // 现在确定每个字段的边界
    var field;
    var tInfo;
    var prevTInfo;
    for( field in titleInfo ){
        tInfo = titleInfo[ field ];
        tInfo.begin = getNearestNum( tInfo.titleBegin, lineArray, false );
        tInfo.end = getNearestNum( tInfo.titleEnd, lineArray, true );

        if( prevTInfo && prevTInfo.begin === tInfo.begin ){
            tInfo.begin = tInfo.titleBegin;
        }

        if( prevTInfo && prevTInfo.end === tInfo.end ){
            prevTInfo.end = tInfo.titleBegin;
        }
        prevTInfo = tInfo;
    }

    console.log( 'TITLE INFO', titleInfo );


    lines.forEach(function( line, index ){
        // 跳过第一行
        if( index > 0 ){
            var values = line.split( /\s+/ );
            var rawData = {};
            // 记录单行的位置情况，防止出现多次出现相同值的情况
            var valuePosRecord = {};

            values.forEach(function( value ){
                var begin = line.indexOf( value, valuePosRecord[ value ] );
                var end = begin + value.length - 1;
                valuePosRecord[ value ] = end;

                if( value == 'svchost.exe' ){
                    console.log( 'SVC', begin, end );
                }

                // 确定字段所在的字段空间
                var field;
                var tInfo;
                for( field in titleInfo ){
                    tInfo = titleInfo[ field ];
                    if( tInfo.begin <= begin && tInfo.end >= end ){

                        if( !rawData[ field ] ){
                            rawData[ field ] = [];
                        }

                        rawData[ field ].push( value );
                        break;
                    }
                }
            });

            tableArray.push( rawData );
        }
    });

    return tableArray;
};

function getNearestNum( cur, list, ifGrate ){

    ifGrate = ( typeof ifGrate === 'undefined' ? false : ifGrate );
    var nearest = cur;
    var min = null;

    list.forEach(function( value ){

        if( ( value - cur > 0 ) == ifGrate || value == cur ){
            if( min === null ){
                min = Math.abs( value - cur );
                nearest = value;
            }
            else {
                if( Math.abs( value - cur ) < min ){
                    min = Math.abs( value - cur );
                    nearest = value;
                }
            }
        }
    });

    return nearest;
}