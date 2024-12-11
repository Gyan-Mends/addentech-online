export const DeleteOutlinedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M14 5a2 2 0 1 0-4 0zM8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32l-.502 5.195a6.5 6.5 0 0 0-1.456-.528l.452-4.667H5.576l1.158 11.967a2.25 2.25 0 0 0 2.24 2.033h1.758A6.5 6.5 0 0 0 11.81 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5zM22 17.5a5.5 5.5 0 1 1-11 0a5.5 5.5 0 0 1 11 0m-7.146-2.354a.5.5 0 0 0-.708.708l1.647 1.646l-1.647 1.646a.5.5 0 0 0 .708.708l1.646-1.647l1.646 1.647a.5.5 0 0 0 .708-.708L17.207 17.5l1.647-1.646a.5.5 0 0 0-.708-.708L16.5 16.793z"
    ></path>
  </svg>
);

export const DeleteOutlinedAnimatedIcon = (
  props: React.SVGProps<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g stroke="currentColor" strokeLinecap="round" strokeWidth={2}>
      <path
        fill="currentColor"
        fillOpacity={0}
        strokeDasharray={60}
        strokeDashoffset={60}
        d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.5s"
          values="60;0"
        ></animate>
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="0.8s"
          dur="0.15s"
          values="0;0.3"
        ></animate>
      </path>
      <path
        fill="none"
        strokeDasharray={8}
        strokeDashoffset={8}
        d="M12 12L16 16M12 12L8 8M12 12L8 16M12 12L16 8"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.6s"
          dur="0.2s"
          values="8;0"
        ></animate>
      </path>
    </g>
  </svg>
);
