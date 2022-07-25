const Excel = require('exceljs');

const createExcel = (dd) => {

	let workbook = new Excel.Workbook();
	let worksheet = workbook.addWorksheet('Acupuntura');

	worksheet.columns = [
	  {header: 'Número', key: 'number'},
	  {header: 'Nombre', key: 'name'},
	  {header: 'Apellidos', key: 'surname'},
	  {header: 'DNI', key: 'dni'},
	  {header: 'Dirección', key: 'address'},
	  {header: 'Ciudad', key: 'city'},
	  {header: 'Concepto', key: 'concept'}, // 7
	  {header: 'Sesiones', key: 'sessions'}, // 8
	  {header: 'Total', key: 'total'},
	  {header: 'Estado', key: 'estate'}
	];

	// force the columns to be at least as long as their header row.
	// Have to take this approach because ExcelJS doesn't have an autofit property.
	worksheet.columns.forEach(column => {
	  column.width = column.header.length < 12 ? 12 : column.header.length
	});

	// Make the header bold.
	// Note: in Excel the rows are 1 based, meaning the first row is 1 instead of 0.
	worksheet.getRow(1).font = {bold: true};

	// Dump all the data into Excel
	dd.docs.forEach((e, index) => {
	  // row 1 is the header.
	  const rowIndex = index + 2

	  let {name, surname, dni, address, city, total, inumber, concept, sessions, createdAt, estate} = e;

	  let ddd = new Date(createdAt);

	  let number = inumber + "/" + ddd.getFullYear();

	  estate = estate === 'cancelled' ? 'Cancelada' : '';

	  let row = worksheet.addRow({
	    number,
	    name,
	    surname,
	    dni,
	    address,
	    city,
	    concept,
	    sessions,
	    total,
	    estate
	  });

	  if (estate === 'Cancelada') {
	    // row.fill = {
	    //     type: 'pattern',
	    //     pattern:'solid',
	    //     fgColor:{argb:'ff0000'},
	    //     bgColor:{argb:'000000'}
	    // };
	    // row.eachCell( function(cell, colNumber){
	    //     if(cell.value)
	    //         row.getCell(colNumber).font = {color: {argb: "004e47cc"}};
	    // });
	    row.eachCell( function(cell, colNumber){
        if(cell.value)
            row.getCell(colNumber).fill = {
			        type: 'pattern',
			        pattern:'solid',
			        fgColor:{argb:'ff0000'},
			        bgColor:{argb:'000000'}
			    	};
	    });
	  }

	});

	const totalNumberOfRows = worksheet.rowCount

	// Add the total Rows
	worksheet.addRow([
	  '',
	  '',
	  '',
	  '',
	  '',
	  '',
	  '',
	  'Total',
	  {
	    formula: `=sumif(J2:J${totalNumberOfRows}, "", I2:I${totalNumberOfRows})`
	  },
	  ''
	]);

	// Set the way columns J - K are formatted
	const figureColumns = [9]
	figureColumns.forEach((i) => {
	  worksheet.getColumn(i).numFmt = '€0.00'
	  worksheet.getColumn(i).alignment = {horizontal: 'center'}
	})

	// Column F needs to be formatted as a percentage.
	// worksheet.getColumn(9).numFmt = '0.00%';

	// loop through all of the rows and set the outline style.
	worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
	  worksheet.getCell(`A${rowNumber}`).border = {
	    top: {style: 'thin'},
	    left: {style: 'thin'},
	    bottom: {style: 'thin'},
	    right: {style: 'none'}
	  }

	  const insideColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

	  insideColumns.forEach((v) => {
	    worksheet.getCell(`${v}${rowNumber}`).border = {
	      top: {style: 'thin'},
	      bottom: {style: 'thin'},
	      left: {style: 'none'},
	      right: {style: 'none'}
	    }
	  })

	  worksheet.getCell(`J${rowNumber}`).border = {
	    top: {style: 'thin'},
	    left: {style: 'none'},
	    bottom: {style: 'thin'},
	    right: {style: 'thin'}
	  }
	})

	const totalCell = worksheet.getCell(`H${worksheet.rowCount}`)
	totalCell.font = {bold: true}
	totalCell.alignment = {horizontal: 'center'}

	// Create a freeze pane, which means we'll always see the header as we scroll around.
	worksheet.views = [
	  { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'B2' }
	]


	// worksheet.getRow(1).fill = {
	// 	type: 'pattern',
	// 	pattern:'solid',
	// 	fgColor:{ argb:'cccccc' }
	// }

	return workbook.xlsx.writeFile('./exports/Psicologia.xlsx');

}

exports.createExcel = createExcel;