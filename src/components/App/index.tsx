"use client";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NoSSR from "@mpth/react-no-ssr";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import format from "format-duration";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import queryString from "query-string";
import { CSSProperties, useMemo, useRef, useState } from "react";
import FullScreen from "react-fullscreen-crossbrowser";
import {
  IoIosHome,
  IoIosPause,
  IoIosPlay,
  IoIosReorder,
  IoIosVolumeHigh,
  IoIosVolumeLow,
  IoIosVolumeMute,
  IoMdExpand,
  IoMdMore,
  IoMdSkipBackward,
  IoMdSkipForward,
  IoMdTrash,
} from "react-icons/io";
import { OnProgressProps } from "react-player/base";
import ReactPlayer from "react-player/lazy";
import Scrollbar from "react-scrollbars-custom";
import Spacer from "react-spacer";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import useMeasure from "react-use-measure";
import { useBoolean, useLocalStorage } from "usehooks-ts";
import styles from "./style.module.scss";
import useRouter from "@/lib/useRouter";

export type Music = {
  id: string;
  title: string;
};

function RowDragHandleCell({ rowId }: { rowId: string }): JSX.Element {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });

  return (
    <button {...attributes} {...listeners}>
      <IoIosReorder size={24} />
    </button>
  );
}

function DraggableRow({ row }: { row: Row<Music> }): JSX.Element {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: row.original.id,
  });
  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Transform.toString(transform),
    transition: transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

type MusicList = {
  id: string;
  title: string;
};

export type AppProps = {
  list: string;
  musicListList: MusicList[];
  musics: Music[];
  v: string;
};

export default function App({
  list,
  musicListList,
  musics,
  v,
}: AppProps): JSX.Element {
  const {
    setFalse: offMuted,
    setTrue: onMuted,
    value: muted,
  } = useBoolean(false);
  const [data, setData] = useState(musics);
  const router = useRouter();
  const {
    setFalse: offPlaying,
    setTrue: onPlaying,
    value: playing,
  } = useBoolean(false);
  const {
    setFalse: offSeeking,
    setTrue: onSeeking,
    value: seeking,
  } = useBoolean(false);
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const [onProgressProps, setOnProgressProps] = useState<OnProgressProps>({
    loaded: 0,
    loadedSeconds: 0,
    played: 0,
    playedSeconds: 0,
  });
  const [volume, setVolume] = useLocalStorage("volume", 0.8);
  const {
    setTrue: onIsFullscreenEnabled,
    setValue: setIsFullscreenEnabled,
    value: isFullscreenEnabled,
  } = useBoolean(false);
  const pathname = usePathname();
  const [tableRef, { width: tableWidth }] = useMeasure();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<Music, any>[]>(
    () => [
      {
        accessorKey: "id",
        cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
        id: "drag-handle",
        size: 30,
      },
      {
        cell: ({ row }) => (
          <Link
            className={styles.link}
            href={queryString.stringifyUrl(
              {
                query: {
                  list,
                  v: row.id,
                },
                url: "/watch",
              },
              {
                skipEmptyString: true,
                skipNull: true,
              },
            )}
          >
            <Image
              alt=""
              height={45}
              quality={100}
              src={`http://img.youtube.com/vi/${row.id}/default.jpg`}
              width={80}
            />
          </Link>
        ),
        id: "thumbnail",
        size: 80,
      },
      {
        accessorKey: "title",
        cell: ({ row, ...info }) => (
          <Link
            className={styles.link2}
            href={queryString.stringifyUrl(
              {
                query: {
                  list,
                  v: row.id,
                },
                url: "/watch",
              },
              {
                skipEmptyString: true,
                skipNull: true,
              },
            )}
          >
            {info.getValue()}
          </Link>
        ),
        size: tableWidth - (30 + 80 + 30),
      },
      {
        cell: () => (
          <Menu
            arrow={true}
            menuButton={
              <MenuButton>
                <IoMdMore size={24} />
              </MenuButton>
            }
            portal={true}
            theming="dark"
            transition={true}
          >
            <MenuItem className={styles.menuItem}>
              <IoMdTrash size={18} />
              削除
            </MenuItem>
          </Menu>
        ),
        id: "menu",
        size: 30,
      },
    ],
    [list, tableWidth],
  );
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data.map(({ id }) => id),
    [data],
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });
  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!active || !over || active.id === over.id) {
      return;
    }

    setData((data) => {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);

      return arrayMove(data, oldIndex, newIndex);
    });
  };
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return (
    <div className={`${styles.wrapper} ${pathname !== "/" ? styles.v : ""}`}>
      <header className={styles.header}>
        <Link
          href={queryString.stringifyUrl(
            {
              query: {
                list,
                v,
              },
              url: "/",
            },
            {
              skipEmptyString: true,
              skipNull: true,
            },
          )}
        >
          <h1>YouTube Music Player</h1>
        </Link>
      </header>
      <main className={styles.main}>
        <div className={styles.playerBlock}>
          <NoSSR>
            <div className={styles.fullScreenBlock}>
              <FullScreen
                enabled={isFullscreenEnabled}
                onChange={(isFullscreenEnabled) =>
                  setIsFullscreenEnabled(isFullscreenEnabled)
                }
              >
                <ReactPlayer
                  controls={true}
                  height="100%"
                  muted={muted}
                  onEnded={() => {
                    const index = data.findIndex(({ id }) => v === id);
                    const { id } =
                      data[index + 1 === data.length ? 0 : index + 1];

                    router.push(`/watch?v=${id}`);
                  }}
                  onPause={() => offPlaying()}
                  onPlay={() => onPlaying()}
                  onProgress={(onProgressProps) => {
                    if (seeking) {
                      return;
                    }

                    setOnProgressProps(onProgressProps);
                  }}
                  playing={playing}
                  ref={reactPlayerRef}
                  url={`https://www.youtube.com/watch?v=${v}`}
                  volume={volume}
                  width="100%"
                />
              </FullScreen>
            </div>
            <div className={styles.buttonsBlock}>
              <button className={styles.button}>
                <IoMdSkipBackward size={30} />
              </button>
              {playing ? (
                <button className={styles.button} onClick={() => offPlaying()}>
                  <IoIosPause size={30} />
                </button>
              ) : (
                <button className={styles.button} onClick={() => onPlaying()}>
                  <IoIosPlay size={30} />
                </button>
              )}
              <button
                className={styles.button}
                onClick={() => {
                  const index = data.findIndex(({ id }) => v === id);
                  const { id } =
                    data[index + 1 === data.length ? 0 : index + 1];

                  router.push(
                    queryString.stringifyUrl(
                      {
                        query: {
                          list,
                          v: id,
                        },
                        url: "/watch",
                      },
                      {
                        skipEmptyString: true,
                        skipNull: true,
                      },
                    ),
                  );
                }}
              >
                <IoMdSkipForward size={30} />
              </button>
              {volume === 0 || muted ? (
                <button className={styles.button} onClick={() => offMuted()}>
                  <IoIosVolumeMute size={30} />
                </button>
              ) : null}
              {volume > 0 && 0.5 >= volume ? (
                <button className={styles.button} onClick={() => onMuted()}>
                  <IoIosVolumeLow size={30} />
                </button>
              ) : null}
              {volume > 0.5 ? (
                <button className={styles.button} onClick={() => onMuted()}>
                  <IoIosVolumeHigh size={30} />
                </button>
              ) : null}
              <input
                max={1}
                min={0}
                onChange={(e) => setVolume(parseFloat(e.currentTarget.value))}
                step="any"
                type="range"
                value={volume}
              />
              <Spacer grow={1} />
              <button
                className={styles.button}
                onClick={() => onIsFullscreenEnabled()}
              >
                <IoMdExpand size={30} />
              </button>
            </div>
            <div className={styles.timesBlock}>
              <div className={styles.timeBlock}>
                {reactPlayerRef.current
                  ? `${format(Math.floor(onProgressProps.playedSeconds) * 1000)} / ${format(reactPlayerRef.current.getDuration() * 1000)}`
                  : null}
              </div>
              <input
                max={0.999999}
                min={0}
                onChange={(e) =>
                  setOnProgressProps((prevOnProgressProps) => ({
                    ...prevOnProgressProps,
                    played: parseFloat(e.target.value),
                  }))
                }
                onMouseDown={() => onSeeking()}
                onMouseUp={(e) => {
                  offSeeking();

                  if (!reactPlayerRef.current) {
                    return;
                  }

                  reactPlayerRef.current.seekTo(
                    parseFloat(e.currentTarget.value),
                  );
                }}
                step="any"
                type="range"
                value={onProgressProps.played}
              />
            </div>
          </NoSSR>
        </div>
        <div className={styles.listBlock}>
          <Tabs>
            <TabList>
              <Tab>動画</Tab>
              <Tab>再生リスト</Tab>
            </TabList>
            <TabPanel>
              <div className={styles.listHeader}>
                <div className={styles.listTitle}>
                  {musicListList.find(({ id }) => list === id)?.title || null}
                </div>
              </div>
              <Scrollbar
                key={tableWidth}
                style={{ opacity: tableWidth > 0 ? 1 : 0 }}
              >
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                >
                  <table className={styles.table} ref={tableRef}>
                    <tbody>
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                          <DraggableRow key={row.id} row={row} />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </DndContext>
              </Scrollbar>
            </TabPanel>
            <TabPanel>aaa</TabPanel>
          </Tabs>
        </div>
      </main>
      <nav className={styles.nav}>
        <IoIosHome size={30} />
      </nav>
    </div>
  );
}
