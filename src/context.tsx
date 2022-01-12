import React from 'react';
import { createContext, useEffect, useRef, useState } from 'react';
import type WebView from 'react-native-webview';
import { defaultTheme as initialTheme, useTheme } from './hooks/useTheme';
import type { FontSize, ReaderContextProps, Theme } from './types';

export const BookContext = createContext<ReaderContextProps>({
  registerBook: () => {},
  changeFontSize: () => {},
  changeFontFamily: () => {},
  goToLocation: () => {},
  goToPage: () => {},
  goPrevious: () => {},
  goNext: () => {},
  goToNote: () => {},
  savePage: () => {},
  search: () => {},
  theme: initialTheme,
  changeTheme: () => {},
  currentLocation: null,
  setCurrentLocation: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  totalPages: 0,
  setTotalPages: () => {},
  progress: 1,
  setProgress: () => {},
  isLoading: false,
  setIsLoading: () => {},
  locations: null,
  setLocations: () => {},
  getCurrentLocation: () => {
    return {
      cfi: '',
      currentPage: 1,
      progress: 1,
      date: new Date(),
    };
  },
} as ReaderContextProps);

export function BookProvider({
  children,
  defaultTheme = initialTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const book = useRef<WebView | null>(null);

  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [progress, setProgress] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [theme, changeTheme] = useTheme(defaultTheme);

  function registerBook(bookRef: WebView) {
    book.current = bookRef;
  }

  function changeFontFamily(fontFamily: string) {
    const themeWithNewFontFamily = {
      ...theme,
      body: {
        ...theme.body,
        'font-family': fontFamily,
      },
      span: {
        ...theme.span,
        'font-family': fontFamily,
      },
      p: {
        ...theme.p,
        'font-family': fontFamily,
      },
      li: {
        ...theme.li,
        'font-family': fontFamily,
      },
      h1: {
        ...theme.h1,
        'font-family': fontFamily,
      },
    };
    changeTheme(themeWithNewFontFamily);
  }

  function changeFontSize(size: FontSize) {
    const themeWithNewFontSize = {
      ...theme,
      fontSize: size,
      body: {
        ...theme.body,
        'font-size': size,
      },
      span: {
        ...theme.span,
        'font-size': size,
      },
      p: {
        ...theme.p,
        'font-size': size,
      },
      li: {
        ...theme.li,
        'font-size': size,
      },
      h1: {
        ...theme.h1,
      },
    };
    changeTheme(themeWithNewFontSize);
  }

  function updateTheme(newTheme: Theme) {
    book.current?.injectJavaScript(`
      window.rendition.themes.register({ theme: ${JSON.stringify(newTheme)} });
      window.rendition.themes.select("theme");
    `);
  }

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  function goToLocation(cfi: string, highlightColor = 'yellow') {
    book.current?.injectJavaScript(`
      window.LOCATIONS=${locations};
      window.rendition.display('${cfi}');
      window.rendition.annotations.remove("${cfi}", "highlight");
      window.rendition.annotations.highlight("${cfi}", {}, (e) => {}, "", {"fill": "${highlightColor}"});
      true
    `);
  }

  function goPrevious() {
    book.current?.injectJavaScript(`window.rendition.prev(); true`);
  }

  function goNext() {
    book.current?.injectJavaScript(`window.rendition.next(); true`);
  }

  function goToNote(cfi: any, page: number = 0) {
    book.current?.injectJavaScript(`
      window.LOCATIONS=${locations};
      window.rendition.display('${cfi}');
      true
    `);
    setCurrentPage(page);
  }

  function getCurrentLocation() {
    return { cfi: currentLocation, currentPage, progress, date: new Date() };
  }

  function search(query: string) {
    book.current?.injectJavaScript(`
      Promise.all(
        window.book.spine.spineItems.map((item) => {
          return item.load(window.book.load.bind(window.book)).then(() => {
            let results = item.find('${query}'.trim());
            item.unload();
            return Promise.resolve(results);
          });
        })
      ).then((results) =>
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'search', results: [].concat.apply([], results) })
        )
      ); true
    `);
  }

  function goToPage(page: number) {
    if (!locations) return Error('No locations');

    const nextPage = Math.round(page);
    const locs = JSON.parse(locations);

    return book.current?.injectJavaScript(`
      window.LOCATIONS=${locations};
      window.rendition.display('${locs[nextPage - 1]}');
      true
    `);
  }

  return (
    <BookContext.Provider
      value={{
        registerBook,
        changeFontSize,
        changeFontFamily,
        goToLocation,
        goToPage,
        goPrevious,
        goNext,
        goToNote,
        search,
        theme,
        changeTheme,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        progress,
        setProgress,
        isLoading,
        setIsLoading,
        currentLocation,
        setCurrentLocation,
        locations,
        setLocations,
        getCurrentLocation,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}
