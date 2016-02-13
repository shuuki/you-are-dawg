// 
// 
// 
// 
// 
// 
// Pulled from index for now -- saved here to re-implement later
// 
// 
// 
// 
// 
// 

// // And a minimap
// var minimapChunks = [3, 3];
// render.Minimap.dims = $.Vec.mult(minimapChunks, renderDims);
// var minimapLand = () => {
// 	var data = gameLand._data;
// 	var cells = $.Arr2D.create(render.Minimap.dims[0], render.Minimap.dims[1]);
// 	var center = minimapChunks.map((x) => Math.floor(x / 2));
// 	var chunk = $.getChunk(render.Renderer.dims, player.pos);
// 	var srcSize = $.Rect.create(render.Renderer.dims, [0, 0]);
	
// 	for (var x = -center[0]; x < minimapChunks[0] - center[0]; x++)
// 	{
// 		for (var y = -center[1]; y < minimapChunks[1] - center[1]; y++)
// 		{
// 			var pos = $.Vec.diff(chunk, [x, y]);
// 			var key = gameLand.keyFn(pos);
// 			if (data[key])
// 			{
// 				// Top left to paste
// 				var offset = $.Vec.mult([-x + center[0], y + center[1]], render.Renderer.dims);
				
// 				for (var c = 0; c < data[key].length; c++)
// 				{
// 					for (var r = 0; r < data[key][c].length; r++)
// 					{
// 						cells[offset[1] + r][offset[0] + c] = { land: data[key][r][c]}
// 					}
// 				}
// 			}
// 		}
// 	}

// 	return cells;
// };
// render.Minimap.add(minimapLand);