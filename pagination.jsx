import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "./utils"
import { buttonVariants } from "./button";
import { useLanguage } from "./LanguageContext";

const Pagination = ({
  className,
  ...props
}) => {
  const { t } = useLanguage();
  return (
    <nav
      role="navigation"
      aria-label={t('pagination_label')}
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props} />
  );
}
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props} />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(buttonVariants({
      variant: isActive ? "outline" : "ghost",
      size,
    }), className)}
    {...props} />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}) => {
  const { t } = useLanguage();
  return (
    <PaginationLink
      aria-label={t('pagination_previous_label')}
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span>{t('pagination_previous')}</span>
    </PaginationLink>
  );
}
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}) => {
  const { t } = useLanguage();
  return (
    <PaginationLink
      aria-label={t('pagination_next_label')}
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}>
      <span>{t('pagination_next')}</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}) => {
  const { t } = useLanguage();
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t('pagination_more_pages')}</span>
    </span>
  );
}
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
