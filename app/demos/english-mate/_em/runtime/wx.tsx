"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { MateIcon } from "../components/MateIcon";

export interface ToastOptions {
  title: string;
  icon?: "success" | "none" | "error" | "loading";
  duration?: number;
}

export interface ModalOptions {
  title?: string;
  content: string;
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: string;
}

export interface ActionSheetOptions {
  itemList: string[];
  itemColor?: string;
}

interface ModalState extends ModalOptions {
  resolve: (res: { confirm: boolean; cancel: boolean }) => void;
}

interface ActionSheetState extends ActionSheetOptions {
  resolve: (res: { tapIndex: number } | null) => void;
}

interface WxContextValue {
  showToast: (opts: ToastOptions) => void;
  showLoading: (opts: { title: string; mask?: boolean }) => void;
  hideLoading: () => void;
  showModal: (opts: ModalOptions) => Promise<{ confirm: boolean; cancel: boolean }>;
  showActionSheet: (opts: ActionSheetOptions) => Promise<{ tapIndex: number } | null>;
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
  navTitleOverride: string | null;
  setNavigationBarTitle: (title: string | null) => void;
  dismissOverlays: () => void;
  toast: { title: string; icon?: ToastOptions["icon"] } | null;
  loading: { title: string; mask?: boolean } | null;
  modal: ModalState | null;
  setModal: React.Dispatch<React.SetStateAction<ModalState | null>>;
  sheet: ActionSheetState | null;
  setSheet: React.Dispatch<React.SetStateAction<ActionSheetState | null>>;
}

const WxContext = createContext<WxContextValue | null>(null);

// Singleton imperative bridge so helper modules (like tts) can also trigger toasts
let globalToast: ((opts: ToastOptions) => void) | null = null;
export function showGlobalToast(opts: ToastOptions) {
  globalToast?.(opts);
}

export function WxProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ title: string; icon?: ToastOptions["icon"] } | null>(null);
  const [loading, setLoading] = useState<{ title: string; mask?: boolean } | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [sheet, setSheet] = useState<ActionSheetState | null>(null);
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [navTitleOverride, setNavigationBarTitle] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((opts: ToastOptions) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setLoading(null);
    setToast({ title: opts.title, icon: opts.icon || "none" });
    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, opts.duration ?? 2000);
  }, []);

  useEffect(() => {
    globalToast = showToast;
    return () => {
      if (globalToast === showToast) globalToast = null;
    };
  }, [showToast]);

  const showLoading = useCallback((opts: { title: string; mask?: boolean }) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
    setLoading({ title: opts.title, mask: opts.mask ?? true });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(null);
  }, []);

  const showModal = useCallback((opts: ModalOptions) => {
    return new Promise<{ confirm: boolean; cancel: boolean }>((resolve) => {
      setModal({
        title: opts.title,
        content: opts.content,
        showCancel: opts.showCancel !== false,
        cancelText: opts.cancelText || "取消",
        confirmText: opts.confirmText || "确定",
        confirmColor: opts.confirmColor || "#B9472F",
        resolve,
      });
    });
  }, []);

  const showActionSheet = useCallback((opts: ActionSheetOptions) => {
    return new Promise<{ tapIndex: number } | null>((resolve) => {
      setSheet({
        itemList: opts.itemList,
        itemColor: opts.itemColor,
        resolve,
      });
    });
  }, []);

  const dismissOverlays = useCallback(() => {
    setLoading(null);
    setModal((prev) => {
      if (prev) prev.resolve({ confirm: false, cancel: true });
      return null;
    });
    setSheet((prev) => {
      if (prev) prev.resolve(null);
      return null;
    });
  }, []);

  return (
    <WxContext.Provider
      value={{
        showToast,
        showLoading,
        hideLoading,
        showModal,
        showActionSheet,
        tabBarHidden,
        setTabBarHidden,
        navTitleOverride,
        setNavigationBarTitle,
        dismissOverlays,
        toast,
        loading,
        modal,
        setModal,
        sheet,
        setSheet,
      }}
    >
      {children}
    </WxContext.Provider>
  );
}

export function WxOverlays() {
  const { toast, loading, modal, setModal, sheet, setSheet } = useWx();

  return (
    <>
      {(toast || loading) && (
        <div
          className={`em-toast-layer ${loading?.mask ? "em-toast-layer--mask" : ""}`}
          role="status"
          aria-live="polite"
        >
          <div className="em-toast">
            {loading || toast?.icon === "loading" ? (
              <span className="em-toast-spinner" />
            ) : toast?.icon === "success" ? (
              <MateIcon name="check" size={18} tone="inverse" />
            ) : null}
            <span>{loading ? loading.title : toast?.title}</span>
          </div>
        </div>
      )}

      {modal && (
        <div className="em-modal-mask" role="dialog" aria-modal="true">
          <div className="em-modal-dialog">
            <div className="em-modal-body">
              {modal.title ? <div className="em-modal-title">{modal.title}</div> : null}
              <div className="em-modal-content">{modal.content}</div>
            </div>
            <div className="em-modal-foot">
              {modal.showCancel && (
                <button
                  type="button"
                  className="em-modal-btn"
                  style={{ color: "#6B6D65" }}
                  onClick={() => {
                    const r = modal.resolve;
                    setModal(null);
                    r({ confirm: false, cancel: true });
                  }}
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                type="button"
                className="em-modal-btn"
                style={{ color: modal.confirmColor || "#B9472F", fontWeight: 600 }}
                onClick={() => {
                  const r = modal.resolve;
                  setModal(null);
                  r({ confirm: true, cancel: false });
                }}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {sheet && (
        <div
          className="em-actionsheet-mask"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            const r = sheet.resolve;
            setSheet(null);
            r(null);
          }}
        >
          <div className="em-actionsheet" onClick={(e) => e.stopPropagation()}>
            {sheet.itemList.map((label, idx) => (
              <button
                key={`${idx}-${label}`}
                type="button"
                className="em-actionsheet-item"
                style={sheet.itemColor ? { color: sheet.itemColor } : undefined}
                onClick={() => {
                  const r = sheet.resolve;
                  setSheet(null);
                  r({ tapIndex: idx });
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className="em-actionsheet-cancel"
              onClick={() => {
                const r = sheet.resolve;
                setSheet(null);
                r(null);
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function useWx() {
  const ctx = useContext(WxContext);
  if (!ctx) throw new Error("useWx must be used within WxProvider");
  return ctx;
}
