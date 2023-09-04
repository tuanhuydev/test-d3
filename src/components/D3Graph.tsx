import { RefObject, useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
import data from "../assets/flare-2.json";

const CONTAINER_WIDTH = 600;
const CONTAINER_HEIGHT = CONTAINER_WIDTH;
const layoutFactory = (data: any) =>
  d3.pack().size([CONTAINER_WIDTH, CONTAINER_HEIGHT]).padding(3)(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a: any, b: any) => b.value - a.value)
  );
const root = layoutFactory(data);
const nodeDescendants = root.descendants();

const colorScale = d3
  .scaleLinear()
  .domain([0, 5])
  .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"] as Array<any>)
  .interpolate(d3.interpolateHcl as any);

export default function D3Graph() {
  const svgRef: RefObject<SVGSVGElement> = useRef(null);
  const labelRef = useRef<any | null>(null);
  const nodeRef = useRef<any | null>(null);

  const makeCircles = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const nodeSelection = svg
      .append("g")
      .selectAll("circle")
      .data(nodeDescendants.slice(1))
      .join("circle")
      .attr("fill", (d) => (d.children ? colorScale(d.depth) : "white"))
      .attr("pointer-events", (d) => (!d.children ? "none" : null));
    nodeRef.current = nodeSelection;
  }, []);

  const makeTexts = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const labelSelection = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(nodeDescendants)
      .join("text")
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d: any) => d.data.name);
    labelRef.current = labelSelection;
  }, []);

  const showContextMenu = (event: any, { data }: any) => {
    console.log(event);
    alert(`Context Menu clicked on Node: ${data.name}`);
  };
  const initSVG = useCallback(() => {
    const svg = d3.select(svgRef.current);

    makeCircles();
    nodeRef.current
      .on(
        "click",
        (event: any, d: any) =>
          focus !== d && (zoom(event, d), event.stopPropagation())
      )
      .on("contextmenu", (event: any, d: any) => {
        event.preventDefault();
        showContextMenu(event, d);
      });

    makeTexts();

    svg.on("click", (event: any) => zoom(event, root));

    let focus = root;
    let view: any;
    const zoomTo = (zoomView: d3.ZoomView) => {
      const [x, y, r] = zoomView;
      view = zoomView;
      const zoomRatio = CONTAINER_WIDTH / r;
      const calculateNewCoordinates = (d: any) =>
        `translate(${(d.x - x) * zoomRatio} ${(d.y - y) * zoomRatio})`;

      labelRef.current.attr("transform", calculateNewCoordinates);
      nodeRef.current.attr("transform", calculateNewCoordinates);
      nodeRef.current.attr("r", (d: any) => d.r * zoomRatio);
    };

    const zoom = (event: any, d: d3.HierarchyCircularNode<unknown>) => {
      focus = d;

      const transition = svg
        .transition()
        .duration(750)
        .tween("zoom", () => {
          const interpolator = d3.interpolateZoom(view, [
            focus.x,
            focus.y,
            focus.r * 2,
          ]);
          return (t) => zoomTo(interpolator(t));
        });

      labelRef.current
        .transition(transition as any)
        .style("fill-opacity", (d: any) => (d.parent === focus ? 1 : 0))
        .style("display", (d: any) => (d.parent === focus ? "inline" : "none"));
    };

    zoomTo([focus.x, focus.y, focus.r * 2]);
  }, [makeCircles, makeTexts]);

  useEffect(() => {
    initSVG();
  }, [initSVG]);

  return (
    <svg
      viewBox={`-${CONTAINER_WIDTH / 2} -${
        CONTAINER_HEIGHT / 2
      } ${CONTAINER_WIDTH} ${CONTAINER_HEIGHT}`}
      width={CONTAINER_WIDTH}
      height={CONTAINER_HEIGHT}
      ref={svgRef}
    />
  );
}
