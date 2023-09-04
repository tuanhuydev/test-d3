import * as d3 from "d3";
import { useRef, useEffect } from "react";

export default function TestComponent() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgElement = d3.select(svgRef.current);
    svgElement
      .selectAll("circle")
      .data([11, 82, 25, 2, 31])
      .join((enter) =>
        enter
          .append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 0)
          .style("opacity", 0)
          .call((enter) =>
            enter
              .transition()
              .duration(1200)
              .style("opacity", 1)
              .attr("cx", (d) => d * 10 + 10)
              .attr("cy", (d) => d * 10 + 10)
              .attr("r", 12)
              .attr("fill", "cornflowerblue")
          )
      )
      .attr("cx", (d) => d * 3 + 55)
      .attr("cy", (d) => d * 7 + 95)
      .attr("r", 15);
  }, []);
  return <svg ref={svgRef} width={1000} height={1000}></svg>;
}
